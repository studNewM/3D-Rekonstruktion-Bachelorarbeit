import ora from "ora";
import decompress from "decompress";
import axios from "axios";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { spawn } from "child_process";
import { unpack } from "7zip-min";
import { glob } from "glob";
import {
  createWriteStream,
  unlinkSync,
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { callPaths } from "./src/utils/executablePaths.js";

const pathMeshroom = process.env.meshroom || "";
const pathColmap = process.env.colmap || "";
const pathOpenMVS = process.env.openMVS || "";
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

function returnCudaLink() {
  const otherValues = [
    "aix",
    "darwin",
    "freebsd",
    "linux",
    "openbsd",
    "sunos",
    "win32",
  ];
  const os = process.platform;
  if (os === "win32") {
    console.log(
      "Bitte installieren Sie NVIDIA CUDA Toolkit => https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html",
    );
  } else if (otherValues.includes(os)) {
    console.log(
      "Bitte installieren Sie NVIDIA CUDA Toolkit => https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html",
    );
  }
}

async function shouldContinueWithoutCuda() {
  const questions = [
    {
      type: "confirm",
      name: "continue",
      message: "Möchten Sie ohne CUDA fortfahren?",
      default: false,
    },
  ];
  const answers = await inquirer.prompt(questions);
  if (answers.continue) {
    return true;
  } else {
    returnCudaLink();
    process.exit(1);
  }
}

function writeGpuToValue(value) {
  let lines = readFileSync("./src/.env", "utf-8").split("\n");

  let gpuIndex = lines.findIndex((line) => line.startsWith("GPU="));

  if (gpuIndex !== -1) {
    lines[gpuIndex] = `GPU=${value}`;
  } else {
    lines.push(`GPU=${value}`);
  }

  writeFileSync("./src/.env", lines.join("\n"));
}

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
async function checkCUDA() {
  const spinner = ora("Überprüfung von NVIDA CUDA...").start();
  await sleep();
  const command = "nvcc";
  return new Promise((resolve, reject) => {
    const child = spawn(command, ["-V"]);
    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    spinner.stop();
    child.on("close", (code) => {
      if (
        code === 0 &&
        output.includes("nvcc: NVIDIA (R) Cuda compiler driver")
      ) {
        console.log(`Überprüfung von NVIDA CUDA...`, chalk.green("OK"));
        writeGpuToValue("true");
        resolve();
      } else if (code === -2) {
        console.log(`Überprüfung von NVIDA CUDA...`, chalk.red("Error"));
        console.log("NVIDIA CUDA nicht gefunden.");
        shouldContinueWithoutCuda().then(() => {
          writeGpuToValue("false");
          resolve();
        });
      }
    });
  });
}

/*
 * Überprüft ob Umgebungsvariablen für die Tools gesetzt worden sind
 */
async function checkEnvForToolPaths() {
  const spinner = ora("Überprüfung der Umgebungsvariablen...").start();
  await sleep();
  spinner.stop();
  console.log("Überprüfung der Umgebungsvariablen...", chalk.green("OK"));
  try {
    let pathsSet = [];
    if (pathMeshroom) pathsSet.push("meshroom");
    if (pathColmap) pathsSet.push("colmap");
    if (pathOpenMVS) pathsSet.push("openMVS");
    if (pathsSet.length === 0) {
      console.log(chalk.red("Kein Pfad ist gesetzt."));
    } else {
      console.log("Gefundene Tools: ", pathsSet);
    }
    if (checkToolDependencies(pathsSet) == false) {
      return -1;
    } else {
      return pathsSet;
    }
  } catch (err) {
    console.error(err);
  }
}

/*
 * Überprüft  die Abhängigkeiten der Tools
 * Für openMVS wird colmap benötigt und für colmap wird openMVS benötigt
 */
function checkToolDependencies(pathsSet) {
  const toolDependencies = {
    openMVS: "colmap",
    colmap: "openMVS",
  };
  for (let tool in toolDependencies) {
    if (
      pathsSet.includes(tool) &&
      !pathsSet.includes(toolDependencies[tool]) &&
      !pathsSet.includes("meshroom")
    ) {
      console.log(chalk.red(`${tool} benötigt ${toolDependencies[tool]}`));
      return false;
    }
  }
  return true;
}

function getToolFiles(toolName, exeName) {
  const toolPath = path.join(process.cwd(), "src", "tools", toolName);
  return readdirSync(toolPath).some((file) => file === toolExe[exeName][0]);
}

async function getToolPath() {
  const toolPath = path.join(process.cwd(), "src", "tools");
  const folderNames = await glob(`${toolPath}/*`);
  if (folderNames.length === 0) {
    console.log(chalk.red("Kein Tools wurden gefunden."));
    return [];
  }
  const downloadedTools = {};
  for (const item of folderNames) {
    const toolName = path.basename(item);
    if (getToolFiles(toolName, "openMVS")) {
      downloadedTools["openMVS"] = toolName;
    } else if (getToolFiles(toolName, "colmap")) {
      downloadedTools["colmap"] = toolName;
    } else if (getToolFiles(toolName, "meshroom")) {
      downloadedTools["meshroom"] = toolName;
    }
  }
  if (checkToolDependencies(Object.keys(downloadedTools)) == false) {
    return -1;
  } else {
    if (downloadedTools.length !== 0) {
      let lines = readFileSync("./src/.env", "utf-8").split("\n");
      for (const item of Object.keys(downloadedTools)) {
        let index = lines.findIndex((line) => line.startsWith(item));
        if (index !== -1) {
          lines[index] =
            `${item} = ${path.join(process.cwd(), "src", "tools", downloadedTools[item])}`;
        }
        writeFileSync("./src/.env", lines.join("\n"));
      }
    }
    return downloadedTools;
  }
}

/*
 * Überprüft ob die Tools bereits im Ordner vorhanden sind
 */
async function verifyToolsInDirectory() {
  const toolPath = path.join(process.cwd(), "src", "tools");
  const spinner = ora("Überprüfung des Ordners...").start();
  await sleep();
  spinner.stop();
  if (!existsSync(toolPath)) {
    console.log(chalk.red("Kein Tools wurden gefunden."));
    return [];
  }
  const downloadedTools = await getToolPath();
  if (downloadedTools !== -1) {
    console.log("Gefundene Tools: ", Object.keys(downloadedTools));
    for (const [tool, toolName] of Object.entries(downloadedTools)) {
      process.env[tool] = path.join(toolPath, toolName);
    }
    return Object.keys(downloadedTools);
  } else {
    return [];
  }
}
function verifyFilePresence(type) {
  try {
    return toolExe[type].every((exe) =>
      existsSync(path.join(process.env[type], exe)),
    );
  } catch (err) {
    console.error(err);
    return false;
  }
}

/*
 * Überprüft ob die Tools korrekt installiert sind
 */
async function verifyToolIntegrity(item) {
  let output = "";
  const command =
    item === "meshroom" ? callPaths[item].command : toolExe[item][0];
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

function validateInstalledTools(items) {
  for (const item of items) {
    if (verifyFilePresence(item) && item === "openMVS") {
      console.log(`Überprüfung von ${item}...`, chalk.green("OK"));
    } else if (verifyFilePresence(item)) {
      verifyToolIntegrity(item);
    } else {
      console.log(`Überprüfung von ${item}...`, chalk.red("Error"));
    }
  }
}

async function executeToolCheck() {
  if (process.platform !== "win32") {
    console.log(chalk.red("Dieses Tool ist nur für Windows verfügbar."));
    process.exit(1);
  }
  try {
    await checkCUDA();
  } catch (error) {
    console.error(error);
  }
  const paths = await checkEnvForToolPaths();
  if (paths === -1) {
    run();
  } else {
    if (paths.length !== 0) {
      validateInstalledTools(paths);
    } else {
      const tools = await verifyToolsInDirectory();
      if (tools.length !== 0) {
        validateInstalledTools(tools);
      } else {
        run();
      }
    }
  }
}
const downloadPaths = {
  meshroom: [
    "Meshroom-2023.3.0",
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
async function promptSoftwareSelection() {
  const questions = [
    {
      type: "list",
      name: "variant",
      message: "Welche Variante möchten Sie installieren?",
      choices: ["Meshroom", "Colmap", "OpenMVS", "Colmap/OpenMVS"],
    },
  ];
  return inquirer.prompt(questions);
}
async function run() {
  const options = await promptSoftwareSelection();
  const select = options.variant;
  const spinner = ora(`Downloading and extracting ${select}...`).start();
  try {
    switch (select) {
      case "Meshroom":
        console.log(`
          ${chalk.red("Aktuell kann Meshroom nicht automatisch heruntergeladen werden")}
          ${chalk.white("Folgen Sie bitte den Anweisungen der Webseite http://alicevision.org/meshroom")}
          `);
        // await downloadAndUnpackTool(
        //   downloadPaths["meshroom"][1],
        //   downloadPaths["meshroom"][0],
        // );
        // spinner.succeed(
        //   `${downloadPaths["meshroom"][1]} heruntergeladen and extrahiert`,
        // );
        // spinner.stop()
        break;
      case "Colmap":
        await downloadAndUnpackTool(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "OpenMVS":
        await downloadAndUnpackTool(
          downloadPaths["openMVS"][1],
          downloadPaths["openMVS"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "Colmap/OpenMVS":
        await downloadAndUnpackTool(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        await downloadAndUnpackTool(
          downloadPaths["openMVS"][1],
          downloadPaths["openMVS"][0],
        );
        spinner.succeed(`Colmap/OpenMVS heruntergeladen and extrahiert`);
        break;
      case "Beide":
        console.log(chalk.green("Beide Varianten werden installiert!"));
        await downloadAndUnpackTool(
          downloadPaths["meshroom"][1],
          downloadPaths["meshroom"][0],
        );
        await downloadAndUnpackTool(
          downloadPaths["colmap"][1],
          downloadPaths["colmap"][0],
        );
        await downloadAndUnpackTool(
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
async function fetchFileFromUrl(url, filename) {
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
async function unpackZipFile(filename) {
  const toolPath = path.join(process.cwd(), "src", "tools");
  await decompress(filename, toolPath);
  unlinkSync(filename);
}
async function unpack7ZipFile(filename) {
  const openMVSPath = path.join(
    process.cwd(),
    "src",
    "tools",
    filename.replace(".7z", ""),
  );
  await zip7(filename, openMVSPath);
}
function zip7(filename, openMVSPath) {
  return new Promise(function (resolved, rejected) {
    unpack(filename, openMVSPath, function (err) {
      if (err) {
        rejected(err);
      } else {
        resolved();
      }
    });
  });
}
async function downloadAndUnpackTool(url, filename) {
  await fetchFileFromUrl(url, filename);
  if (filename.endsWith(".7z")) {
    await unpack7ZipFile(filename);
  } else if (filename.endsWith(".zip")) {
    await unpackZipFile(filename);
  }
}

(async () => {
  await executeToolCheck();
})();
