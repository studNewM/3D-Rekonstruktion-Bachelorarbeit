import path from "path";

export const typeConfigs = {
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