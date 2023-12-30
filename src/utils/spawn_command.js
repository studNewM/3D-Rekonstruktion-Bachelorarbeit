import WebSocket from 'ws';
import { watchWorkspace } from './watchDirectory.js';
import { spawn } from 'node:child_process';
import { typeConfigs } from './commandConfigs.js';
import sendToAllClients from './websocketToClient.js';

export default function spawnCommand(commandText, type = "", wss, stepName) {
    if (!typeConfigs[type]) {
        console.error(`Unknown type: ${type}`);
        throw new Error(`Unknown type: ${type}`);
    }
    if (type === "meshroom") {
        setTimeout(() => watchWorkspace(wss), 10000);
    }
    return new Promise((resolve, reject) => {
        const args = commandText.split(' ');
        const config = typeConfigs[type];


        const command = typeof config.command === "function" ? config.command(args) : config.command;
        const commandArgs = config.args(args);
        const cwd = config.cwd;

        const child = spawn(command, commandArgs, { cwd });
        console.log(`Running command: ${command} ${cwd} ${commandArgs.join(' ')}`);


        if (type !== "meshroom") {
            sendToAllClients(wss, { step: stepName, status: 'started' });
        }
        child.stdout.on('data', data => {
            console.log(data.toString());
        });

        child.stderr.on('data', data => {
            console.error(data.toString());
        });

        child.on('close', code => {
            if (type !== "meshroom") {
                sendToAllClients(wss, { step: stepName, status: 'completed' });
            }
            if (code !== 0) {
                reject(new Error(`Command exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}
