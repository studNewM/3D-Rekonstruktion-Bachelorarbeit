import { exec, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export default function execute_Command(text, type = "") {
    let command = "";
    let cwd_path = "";
    const colmap_path = path.normalize(path.join(process.cwd(), "tools", "COLMAP-3.8-windows-cuda"));
    const openMVS_path = path.normalize(path.join(process.cwd(), "tools", "OpenMVS_Windows_x64"));
    if (type == "colmap") {
        command = "COLMAP.bat " + text;
        cwd_path = colmap_path;
        console.log(cwd_path);
    }
    else if (type == "openMVS") {
        command = text;
        cwd_path = openMVS_path;
    }
    try {
        const output = execSync(command, { encoding: 'utf-8', cwd: cwd_path });
        console.log('Output was:\n', output);
    } catch (error) {
        console.error('Error: ', error);
    }
}
