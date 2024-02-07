
export const callPaths = {
  colmap: {
    command: "cmd.exe",
    args: (args) => ["/c", "COLMAP.bat"].concat(args),
    cwd: process.env["colmap"]
  },
  openMVS: {
    command: (args) => args[0],
    args: (args) => args.slice(1),
    cwd: process.env["openMVS"]
  },
  meshroom: {
    command: "meshroom_batch.exe",
    args: (args) => args,
    cwd: process.env["meshroom"]
  },
};
