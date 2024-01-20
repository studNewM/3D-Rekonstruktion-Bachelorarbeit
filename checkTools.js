import ora from "ora";
import decompress from "decompress";
import axios from "axios";
import path from "path";
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from "fs";
import dotenv from "dotenv";
import inquirer from "inquirer";
import chalk from "chalk";
import { spawn } from "child_process";
import { typeConfigs } from "./src/utils/commandConfigs.js";
import { unpack } from "7zip-min";
import { mkdir, unlink } from "fs/promises";

dotenv.config({ path: "./src/.env" });

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
const meshroomPath = process.env.meshroom || "";
const colmapPath = process.env.colmap || "";
const openMVSPath = process.env.openMVS || "";

async function checkIfToolEnvExist() {
  const spinner = ora("Überprüfung der Umgebungsvariablen...").start();
  let pathsSet = [];

  await sleep();
  spinner.stop();
  console.log("Überprüfung der Umgebungsvariablen...", chalk.green("OK"));
  try {
    if (meshroomPath !== "" || colmapPath !== "" || openMVSPath !== "") {
      if (meshroomPath !== "") {
        pathsSet.push("meshroom");
      }
      if (colmapPath !== "") {
        pathsSet.push("colmap");
      }
      if (openMVSPath !== "") {
        pathsSet.push("openMVS");
      }
      console.log("Gefundene Tools: ", pathsSet);
    } else {
      console.log(chalk.red("Kein Pfad ist gesetzt."));
      console.log("\t");
    }
    return pathsSet;
  } catch (err) {
    console.error(err);
  }
}

const toolExe = {
  meshroom: ["meshroom_batch.exe"],
  colmap: ["COLMAP.bat"],
  openMVS: [
    "Tests.exe",
    "InterfaceCOLMAP.exe",
    "DensifyPointCloud.exe",
    "ReconstructMesh.exe",
    "RefineMesh.exe",
    "TextureMesh.exe",
  ],
};

function checkFileExistence(type) {
  try {
    const result = toolExe[type].every((exe) =>
      existsSync(path.join(process.env[type], exe)),
    );
    return result;
  } catch (err) {
    console.error(err);
  }
}

async function checkIntegrity(item) {
  let output = "";
  const command =
    item === "meshroom" ? typeConfigs[item].command : toolExe[item][0];
  const args = item !== "meshroom" ? ["--help"] : [];
  const child = spawn(command, args, { cwd: process.env[item] });

  child.stdout.on("data", (data) => {
    output += data.toString();
  });
  child.on("close", (code) => {
    if (code === 0 && item === "openMVS") {
      console.log(`Überprüfung von ${item}...`, chalk.green("OK"));
    } else if (
      (code !== 0 &&
        output.includes(
          "Nothing to compute. You need to set --input or --inputRecursive.",
        )) ||
      output.includes("https://colmap.github.io/")
    ) {
      console.log(`Überprüfung von ${item}...`, chalk.green("OK"));
    } else {
      console.log(`Überprüfung von ${item}...`, chalk.red("Error"));
    }
  });
}

async function testTool() {
  const paths = await checkIfToolEnvExist();
  if (paths.length !== 0) {
    for (const item of paths) {
      if (checkFileExistence(item) && item === "openMVS") {
        console.log(`Überprüfung von ${item}...`, chalk.green("OK"));
      } else if (checkFileExistence(item)) {
        checkIntegrity(item);
      } else {
        console.log(`Überprüfung von ${item}...`, chalk.red("Error"));
      }
    }
  } else {
    run();
  }
}

(async () => {
  await testTool();
})();

const downloadPaths = {
  meshroom: [
    "COLMAP-3.9.1-windows-cuda.zip",
    "https://www.fosshub.com/Meshroom.html?dwl=Meshroom-2023.3.0-win64.zip",
  ],
  colmap: [
    "COLMAP-3.8-windows-cuda.zip",
    "https://github.com/colmap/colmap/releases/download/3.8/COLMAP-3.8-windows-cuda.zip",
  ],
  openMVS: [
    "OpenMVS_Windows_x64.7z",
    "https://github.com/cdcseacave/openMVS/releases/download/v2.2.0/OpenMVS_Windows_x64.7z",
  ],
};

async function softwareSelect() {
  const questions = [
    {
      type: "list",
      name: "variant",
      message: "Welche Variante möchten Sie installieren?",
      choices: ["Colmap", "OpenMVS", "Colmap/OpenMVS"],
    },
  ];
  return inquirer.prompt(questions);
}

async function run() {
  const options = await softwareSelect();
  const select = options.variant;

  const spinner = ora(`Downloading and extracting ${select}...`).start();

  try {
    switch (select) {
      case "Meshroom":
        await downloadAndExtract(
          downloadPaths["meshroom"][1],
          downloadPaths["meshroom"][0],
        );
        spinner.succeed(
          `${downloadPaths["meshroom"][1]} heruntergeladen and extrahiert`,
        );
        break;

      case "Colmap":
        await downloadAndExtract(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "OpenMVS":
        await downloadAndExtract(
          downloadPaths["openMVS"][1],
          downloadPaths["openMVS"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "Colmap/OpenMVS":
        await downloadAndExtract(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        await downloadAndExtract(
          downloadPaths["openMVS"][1],
          downloadPaths["openMVS"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "Beide":
        console.log(chalk.green("Beide Varianten werden installiert!"));
        await downloadAndExtract(
          downloadPaths["meshroom"][1],
          downloadPaths["meshroom"][0],
        );
        await downloadAndExtract(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        await downloadAndExtract(
          downloadPaths["openMVS"][1],
          downloadPaths["openMVS"][0],
        );
        spinner.succeed(`Beide Varianten heruntergeladen and extrahiert`);
        break;
      default:
        break;
    }
  } catch (error) {
    spinner.fail(
      "Es ist ein Fehler beim herunterladen der Software aufgetreten: " +
        error.message,
    );
  }
}

async function downloadFile(url, filename) {
  const writer = createWriteStream(filename);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function extractFile(filename) {
  const toolPath = path.join(process.cwd(), "tools");
  await decompress(filename, toolPath);
  unlinkSync(filename);
}

async function extract7Zip(filename) {
  const openMVSPath = path.join(
    process.cwd(),
    "tools",
    filename.replace(".7z", ""),
  );
  if (!existsSync(openMVSPath)) {
    mkdirSync(openMVSPath);
  }
  unpack(filename, openMVSPath);
  unlinkSync(filename);
}

async function downloadAndExtract(url, filename) {
  await downloadFile(url, filename);
  if (filename.endsWith(".7z")) {
    await extract7Zip(filename);
  }
  {
    await extractFile(filename);
  }
}
