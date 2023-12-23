// import { spawn } from 'node:child_process';
// import path from 'node:path';
// import { WebSocket } from 'ws'; // Importieren von WebSocket aus ws

// export default function spawn_meshroom(wss) {

// const workspace = path.normalize(path.join(process.cwd(), "workspace"));

// const output_path = path.join(workspace, "output");
// const images = path.join(process.cwd(), "images", "images_jpg");
// const pipeline = "photogrammetry";
// const meshroom_command = ["-i", images, "-p", pipeline, "-o", output_path, "--cache", workspace];
// console.log(meshroom_command);
// const meshroom_exe_path = path.normalize(path.join(process.cwd(), "tools", "Meshroom", "meshroom_batch.exe"));

// const command = spawn(meshroom_exe_path, meshroom_command);

// command.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//     // wss.clients.forEach(client => {
//     //     if (client.readyState === WebSocket.OPEN) {
//     //         client.send(`stdout: ${data}`);
//     //     }
//     // });
// });

// command.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     // wss.clients.forEach(client => {
//     //     if (client.readyState === WebSocket.OPEN) {
//     //         client.send(`stderr: ${data}`);
//     //     }
//     // });
// });

// command.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//     // wss.clients.forEach(client => {
//     //     if (client.readyState === WebSocket.OPEN) {
//     //         client.send(`Process completed with code ${code}`);
//     //     }
//     // });
// });

// const command = spawn('./tools/Meshroom/meshroom_batch.exe', ["-i", "./images/images_jpg", "-p", "photogrammetry", "-o", "./o"], {
//     detached: false
// });
// command.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });

// command.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
// });

// command.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
// });

// }

// import path from 'node:path';
import { WebSocket } from 'ws';
// import { spawn } from 'node:child_process';


// export default function spawn_Command(text, type = "", wss) {
//     let command;
//     let cwd_path = "";
//     let args = text.split(' ');


//     const colmap_path = path.normalize(path.join(process.cwd(), "tools", "COLMAP-3.8-windows-cuda"));
//     const openMVS_path = path.normalize(path.join(process.cwd(), "tools", "OpenMVS_Windows_x64"));
//     const meshroom_path = path.normalize(path.join(process.cwd(), "tools", "Meshroom"));

//     if (type == "colmap") {
//         command = "cmd.exe";
//         args = ["/c", "COLMAP.bat"].concat(args);
//         cwd_path = colmap_path;
//     }
//     else if (type == "openMVS") {
//         command = args[0];
//         args = args.slice(1)
//         cwd_path = openMVS_path;
//     }
//     else if (type === "meshroom") {
//         cwd_path = meshroom_path
//         command = "meshroom_batch.exe ";
//     }
//     const child = spawn(command, args, { cwd: cwd_path });

//     child.stdout.on('data', (data) => {
//         console.log(`stdout: ${data}`);
//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(`stdout: ${data}`);
//             }
//         });
//     });

//     child.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(`stderr: ${data}`);
//             }
//         });
//     });

//     child.on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//     });
// }

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const logStream = fs.createWriteStream('output.log', { flags: 'a' });

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

export default function spawn_Command(text, type = "", wss) {
    return new Promise((resolve, reject) => {
        const args = text.split(' ');
        const config = typeConfigs[type];

        if (!config) {
            console.error(`Unknown type: ${type}`);
            reject(new Error(`Unknown type: ${type}`));
            return;
        }

        const command = typeof config.command === "function" ? config.command(args) : config.command;
        const commandArgs = config.args(args);
        const cwd = config.cwd;

        const child = spawn(command, commandArgs, { cwd });

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`stdout: ${data}`);
                }
            });
        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`stderr: ${data}`);
                }
            });
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}