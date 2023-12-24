import { spawn } from 'node:child_process';
import path from 'node:path';
import WebSocket from 'ws';

const typeConfigs = {
    colmap: {
        command: "cmd.exe",
        args: args => ["/c", "COLMAP.bat"].concat(args),
        cwd: path.normalize(path.join(process.cwd(), "tools", "COLMAP-3.8-windows-cuda"))
    },
    openMVS: {
        command: args => args[0],
        args: args => args.slice(1),
        cwd: path.normalize(path.join(process.cwd(), "tools", "OpenMVS_Windows_x64"))
    },
    meshroom: {
        command: "meshroom_batch.exe",
        args: args => args,
        cwd: path.normalize(path.join(process.cwd(), "tools", "Meshroom"))
    }
};


export default function spawn_Command(text, type = "", wss, step_name) {
    return new Promise((resolve, reject) => {
        const args = text.split(' ');
        const config = typeConfigs[type];

        if (!config) {
            console.error(`Unknown type: ${type}`);
            reject(new Error(`Unknown type: ${type}`));
            return;
        }

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ step: step_name, status: 'started' }));
            }
        });

        const command = typeof config.command === "function" ? config.command(args) : config.command;
        const commandArgs = config.args(args);
        const cwd = config.cwd;

        const child = spawn(command, commandArgs, { cwd });

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);

        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);

        });

        child.on('close', (code) => {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ step: step_name, status: 'completed' }));
                }
            });
            if (code !== 0) {
                reject(new Error(`Command exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}