import { closeWatcher, watchWorkspace } from "./watchDirectory.js";
import { spawn } from "node:child_process";
import { callPaths } from "./executablePaths.js";
import sendToAllClients from "./websocketToClient.js";

export default function spawnCommand(commandText, type = "", stepName) {
  if (!callPaths[type]) {
    console.error(`Unknown type: ${type}`);
    throw new Error(`Unknown type: ${type}`);
  }
  if (type === "meshroom") {
    console.log("Starte Meshroom");
    watchWorkspace();
  }
  return new Promise((resolve, reject) => {
    let stderrOutput = "";

    const args = commandText.split(" ");
    const config = callPaths[type];

    const command =
      typeof config.command === "function"
        ? config.command(args)
        : config.command;
    const commandArgs = config.args(args);
    const cwd = config.cwd;

    const child = spawn(command, commandArgs, { cwd });

    if (type !== "meshroom") {
      sendToAllClients({ step: stepName, status: "started" });
    }
    child.stdout.on("data", (data) => {
      console.log(data.toString());
      if (data.includes("ERROR")) {
        sendToAllClients({ message: data.toString() });
      }
    });

    child.stderr.on("data", (data) => {
      stderrOutput += data.toString();
      console.error(data.toString());
      if (data.includes("ERROR")) {
        sendToAllClients({
          step: stepName,
          status: "ERROR",
          message: data.toString(),
        });
      }
    });

    child.on("close", (code) => {
      if (type !== "meshroom") {
        sendToAllClients({ step: stepName, status: "completed" });
      }
      if (code !== 0) {
        if (stderrOutput.includes("fatal")) {
          const nodeType = stderrOutput
            .split("RuntimeError: Error on node")[1]
            .split(":")[0]
            .split("_1")[0]
            .replace(/"/g, "")
            .trimStart();
          const fatalMessage = stderrOutput
            .split("[fatal]")[1]
            .split("\n")[0]
            .trimStart();
          sendToAllClients({
            step: nodeType,
            status: "failed",
            message: fatalMessage,
          });
        } else if (stderrOutput.includes("RuntimeError")) {
          const nodeType = stderrOutput
            .split("RuntimeError: Error on node")[1]
            .split(":")[0]
            .split("_1")[0]
            .replace(/"/g, "")
            .trimStart();
          const fatalMessage = stderrOutput
            .split("RuntimeError: Error on node")[1]
            .split(":")[1]
            .split("\n")[0]
            .trimStart();
          sendToAllClients({
            step: nodeType,
            status: "failed",
            message: fatalMessage,
          });
        }
        closeWatcher();
        reject(new Error("Prozess mit Fehler beendet"));
      } else {
        console.log("Prozess erfolgreich beendet");
        resolve();
      }
    });
  });
}
