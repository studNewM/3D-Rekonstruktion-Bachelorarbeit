import * as Three from "./three.js";

const stepsByOption = {
  Meshroom: [
    "CameraInit",
    "FeatureExtraction",
    "ImageMatching",
    "FeatureMatching",
    "StructureFromMotion",
    "PrepareDenseScene",
    "DepthMap",
    "DepthMapFilter",
    "Meshing",
    "MeshFiltering",
    "Texturing",
    "Publish",
  ],
  "Colmap/OpenMVS": [
    "feature_extractor",
    "exhaustive_matcher",
    "mapper",
    "image_undistorter",
    "model_converter",
    "InterfaceCOLMAP",
    "DensifyPointCloud",
    "ReconstructMesh",
    "RefineMesh",
    "TextureMesh",
  ],
};
let paths = {};
let completedCount = 0;

function activateButton(process) {
  const buttons = ["Anzeigen", "Export"].map((action) =>
    document.getElementById(`button-${action}-${process}`),
  );
  buttons.forEach((button) => {
    if (button) {
      button.classList.remove("disabled");
    }
  });
}

function handleExportClick(stepName) {
  console.log(`Export für Schritt ${stepName} ausgelöst.`);
}

function handleShowClick(stepName) {
  const selectedOption = document.getElementById("modelSelector").value;
  if (["StructureFromMotion"].includes(stepName)) {
    getModelPath(stepName).then((response) => {
      const path = response.data[0].split("\\")[2];
      Three.loadModel(stepName, selectedOption, path);
    });
  } else {
    Three.loadModel(stepName, selectedOption);
  }
}

function handleAutomaticModelLoading(stepName) {
  const selectedOption = document.getElementById("modelSelector").value;

  if (["StructureFromMotion", "Meshing", "Texturing"].includes(stepName)) {
    getModelPath(stepName).then((response) => {
      const path = response.data[0].split("\\")[2];
      Three.loadModel(stepName, selectedOption, path);
    });
  } else if (
    ["model_converter", "ReconstructMesh", "TextureMesh"].includes(stepName)
  ) {
    console.log("Automatic Model Loading");
    Three.loadModel(stepName, selectedOption);
  }
}

function reloadCss() {
  const imageCount = document.getElementById("imageCount");
  imageCount.innerText = "";

  const cameraDetails = document.getElementById("cameraDetails");
  cameraDetails.innerText = "";

  const focalLengths = document.getElementById("focalLength");
  focalLengths.innerText = "";

  const imagecount = document.getElementById("imageCountTooltip");
  imagecount.innerHTML = "";
  imagecount.style.backgroundColor = "";

  const cameraTypes = document.getElementById("cameraTypesTooltip");
  cameraTypes.innerHTML = "";
  cameraTypes.style.backgroundColor = "";

  const otherInfo = document.getElementById("otherInfoTooltip");
  otherInfo.innerHTML = "";
  otherInfo.style.backgroundColor = "";

  const processElements = document.getElementsByClassName("progressLine");

  for (let i = 0; i < processElements.length; i++) {
    processElements[i].style.backgroundColor = "white";
  }

  const imagePreview = document.getElementById("imagePreview");
  imagePreview.innerHTML = "";
  imagePreview.style = "";

  const dropArea = document.createElement("div");
  dropArea.id = "dropArea";
  dropArea.className = "drop-area";

  const uploadIcon = document.createElement("i");
  uploadIcon.className = "fa fa-upload";
  uploadIcon.id = "upload_icon";

  const textParagraph = document.createElement("p");
  textParagraph.innerHTML = "Drag & Drop Ihre Dateien hier <br />";

  const fileInputLabel = document.createElement("label");
  fileInputLabel.className = "file-input-label";
  fileInputLabel.htmlFor = "folderPicker";
  fileInputLabel.textContent = "oder klicken Sie, um Dateien auszuwählen";

  textParagraph.appendChild(fileInputLabel);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "folderPicker";
  fileInput.setAttribute("webkitdirectory", "");
  fileInput.multiple = true;
  fileInput.style.display = "none";

  dropArea.appendChild(uploadIcon);
  dropArea.appendChild(textParagraph);
  dropArea.appendChild(fileInput);

  imagePreview.appendChild(dropArea);
  setupDragAndDrop();
}

document.getElementById("restart").addEventListener("click", () => reloadCss());

function createProgressNodes() {
  const selectedOption = document.getElementById("modelSelector").value;
  const steps = stepsByOption[selectedOption] || [];

  const progressContainer = document.getElementById("progressContainer");
  progressContainer.innerHTML = "";

  steps.forEach((stepName) => {
    const step = document.createElement("div");
    step.classList.add("progressStep");
    step.textContent = stepName;
    step.id = `process-${stepName}`;

    if (
      [
        "StructureFromMotion",
        "Meshing",
        "Texturing",
        "model_converter",
        "ReconstructMesh",
        "TextureMesh",
      ].includes(stepName)
    ) {
      const dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      const dropbtn = document.createElement("ul");
      dropbtn.classList.add("dropbtn", "icons", "btn-right", "showLeft");
      dropbtn.onclick = () => showDropdown(`dropdown-${stepName}`);

      for (let i = 0; i < 3; i++) {
        dropbtn.appendChild(document.createElement("li"));
      }

      dropdown.appendChild(dropbtn);

      const dropdownContent = document.createElement("div");
      dropdownContent.classList.add("dropdown-content");
      dropdownContent.id = `dropdown-${stepName}`;

      const runType = {
        Meshroom: {
          StructureFromMotion: "sfm.ply",
          Meshing: "mesh.obj",
          Texturing: "texturedMesh.obj",
        },
        Colmap: {
          StructureFromMotion: "sparse/0/sfm.ply",
          Meshing: "dense",
          Texturing: "texturedMesh.obj",
        },
      };

      ["Anzeigen", "Export"].forEach((text) => {
        let element;

        if (text === "Export") {
          //TODO: Pfad anpassen
          element = document.createElement("a");
          element.href = "/assets/";
          // element.download = runType[selectedOption][stepName];
        } else {
          element = document.createElement("button");
        }
        element.textContent = text;
        element.id = `button-${text}-${stepName}`;
        console.log(stepName);
        element.classList.add("dropdown-btn");
        dropdownContent.appendChild(element);
      });

      dropdown.appendChild(dropdownContent);
      step.appendChild(dropdown);
    }

    const progressLine = document.createElement("div");
    progressLine.classList.add("progressLine");
    progressLine.id = `progress-${stepName}-line`;
    step.appendChild(progressLine);

    progressContainer.appendChild(step);
  });
  if (selectedOption === "Meshroom") {
    document
      .getElementById("button-Export-StructureFromMotion")
      .addEventListener("click", () =>
        handleExportClick("StructureFromMotion"),
      );
    document
      .getElementById("button-Export-Meshing")
      .addEventListener("click", () => handleExportClick("Meshing"));
    document
      .getElementById("button-Export-Texturing")
      .addEventListener("click", () => handleExportClick("Texturing"));

    document
      .getElementById("button-Anzeigen-StructureFromMotion")
      .addEventListener("click", () => handleShowClick("StructureFromMotion"));
    document
      .getElementById("button-Anzeigen-Meshing")
      .addEventListener("click", () => handleShowClick("Meshing"));
    document
      .getElementById("button-Anzeigen-Texturing")
      .addEventListener("click", () => handleShowClick("Texturing"));
  } else {
    document
      .getElementById("button-Anzeigen-model_converter")
      .addEventListener("click", () => handleShowClick("model_converter"));
    document
      .getElementById("button-Anzeigen-ReconstructMesh")
      .addEventListener("click", () => handleShowClick("ReconstructMesh"));
    document
      .getElementById("button-Anzeigen-TextureMesh")
      .addEventListener("click", () => handleShowClick("TextureMesh"));

    document
      .getElementById("button-Export-model_converter")
      .addEventListener("click", () => handleExportClick("model_converter"));
    document
      .getElementById("button-Export-ReconstructMesh")
      .addEventListener("click", () => handleExportClick("ReconstructMesh"));
    document
      .getElementById("button-Export-TextureMesh")
      .addEventListener("click", () => handleExportClick("TextureMesh"));
  }
}
function showDropdown(id) {
  document.getElementById(id).classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function handleCheckboxChange() {
  const checkbox = document.getElementsByClassName("runOption");
  for (let item of checkbox) {
    item.disabled = true;
  }
  const selectedOption = {
    [checkbox[0].labels[0].title]: checkbox[0].checked,
    [checkbox[1].labels[0].innerHTML]: checkbox[1].checked,
  };
  return selectedOption;
}

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});
document.addEventListener("DOMContentLoaded", () => {
  createProgressNodes();
  setupEventListeners();
  initializeWebSocket();
});

function setupEventListeners() {
  document
    .getElementById("startProcess")
    .addEventListener("click", startReconstructionProcess);
  document
    .getElementById("folderPicker")
    .addEventListener("change", handleFileSelection);
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", toggleSidebar);
  document
    .getElementById("modelSelector")
    .addEventListener("change", createProgressNodes);
  setupDragAndDrop();
}

function initializeWebSocket() {
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = handleWebSocketOpen;
  ws.onmessage = handleWebSocketMessage;
  ws.onerror = handleWebSocketError;
  ws.onclose = handleWebSocketClose;
}

function handleWebSocketOpen() {
  console.log("WebSocket-Verbindung geöffnet");
}

function handleWebSocketError(error) {
  console.error("WebSocket-Fehler:", error);
}

function handleWebSocketClose() {
  console.log("WebSocket-Verbindung geschlossen");
}
function setupDragAndDrop() {
  const dropArea = document.getElementById("dropArea");
  dropArea.addEventListener("dragover", (event) => event.preventDefault());
  dropArea.addEventListener("dragleave", () =>
    dropArea.classList.remove("drag-over"),
  );
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");
    handleFileSelection(event);
  });
}

function areValidFiles(files) {
  return Array.from(files).every((file) =>
    /\.(jpg|png|jpeg)$/i.test(file.name),
  );
}

function startReconstructionProcess() {
  const startButton = document.getElementById("startProcess");
  startButton.disabled = true;

  const selectedOption = document.getElementById("modelSelector").value;
  const pipelineOptions = handleCheckboxChange();
  axios
    .post("/reconstruction", {
      model: selectedOption,
      options: pipelineOptions,
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}
async function getModelPath(step) {
  const modelPath = await axios.get("/modelPath", {
    params: { modelRequest: step },
  });
  return modelPath;
}

function handleWebSocketMessage(event) {
  const data = JSON.parse(event.data);
  const processElement = document.getElementById(`progress-${data.step}-line`);
  const pipelineOptions = handleCheckboxChange();

  switch (data.status) {
    case "started":
      processElement.style.backgroundColor = "yellow";
      break;
    case "completed":
      completedCount++;
      processElement.style.backgroundColor = "green";
      console.log(completedCount);
      handleStepCompletion(data.step);
      activateButton(data.step);
      if (pipelineOptions["Zwischenergebnisse laden"] === true) {
        handleAutomaticModelLoading(data.step);
      }
      break;
    case "failed":
      processElement.style.backgroundColor = "red";
      alert(`${data.step} fehlgeschlagen:\n${data.message}`);
      break;
    case "ERROR":
      processElement.style.backgroundColor = "red";
      alert(`${data.step} fehlgeschlagen:\n${data.message}`);
      break;
    default:
      console.warn("Unbekannter Status:", data.status);
  }
}

function handleStepCompletion(stepName) {
  const selectedOption = document.getElementById("modelSelector").value;
  if (
    (selectedOption === "Colmap/OpenMVS" && completedCount >= 11) ||
    (selectedOption === "Meshroom" && stepName === "Publish")
  ) {
    document.getElementById("startProcess").disabled = false;
    completedCount = 0;
    alert("Prozess abgeschlossen!");
    if (selectedOption === "Meshroom") {
      // initModels();
    }
  }
}

function handleFileSelection(event) {
  let files;
  if (event.type === "drop") {
    files = event.dataTransfer.files;
  } else {
    files = event.target.files;
  }

  if (files.length === 0) {
    alert("Bitte wählen Sie Dateien aus.");
    return;
  }

  if (!areValidFiles(files)) {
    alert("Bitte wählen Sie nur .jpg oder .png Dateien.");
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("fileList", files[i]);
  }
  axios
    .post("/upload", formData)
    .then((response) => {
      updateImagePreview(files);
      document.getElementById("startProcess").disabled = false;
      alert("Bilder erfolgreich hochgeladen!");
      getFileDetails();
    })
    .catch((error) => {
      console.error("Fehler beim Hochladen der Bilder:", error);
      alert("Fehler beim Hochladen der Bilder.");
    });
}

function getFileDetails() {
  axios
    .get("/metadata")
    .then((response) => {
      console.log("Metadaten extrahiert");
      displayMetadata(response.data);
    })
    .catch((error) => {
      console.error("Fehler beim Extrahieren der Metadaten", error);
    });
}

function displayMetadata(metadata) {
  const imageCount = document.getElementById("imageCount");
  imageCount.innerText = metadata.totalImages;

  const cameraInfos = metadata.cameras.map((camera) => camera.maker).join("|");
  const cameraDetails = document.getElementById("cameraDetails");
  cameraDetails.innerText = cameraInfos;

  const focalLengthsDetails = metadata.cameras
    .map((camera) => camera.focalLengths)
    .flat()
    .join("|");
  const focalLengths = document.getElementById("focalLength");
  focalLengths.innerText = focalLengthsDetails;

  updateTooltips(metadata);
}
function updateTooltips(cameraInfo) {
  let imageCountTooltipContent = "";
  let cameraTypesTooltipContent = "";
  let otherInfoTooltipContent = "";

  for (const camera of cameraInfo.cameras) {
    imageCountTooltipContent += `${camera.maker}:<br>`;
    for (const [focalLength, count] of Object.entries(
      camera.imageCountsByFocalLength,
    )) {
      imageCountTooltipContent += `&nbsp;&nbsp;${focalLength}: ${count} Bild(er)<br>`;
    }
    imageCountTooltipContent += "<br>";
    cameraTypesTooltipContent += `${camera.combine}<br>`;
    otherInfoTooltipContent += `Kamera: ${camera.combine}, ISO: ${camera.isoValues.join(", ")}, Brennweiten: ${camera.focalLengths.join(", ")}<br>`;
  }

  const imagecount = document.getElementById("imageCountTooltip");
  imagecount.innerHTML = imageCountTooltipContent;
  imagecount.style.backgroundColor = "#525252";

  const cameraTypes = document.getElementById("cameraTypesTooltip");
  cameraTypes.innerHTML = cameraTypesTooltipContent;
  cameraTypes.style.backgroundColor = "#525252";

  const otherInfo = document.getElementById("otherInfoTooltip");
  otherInfo.innerHTML = otherInfoTooltipContent;
  otherInfo.style.backgroundColor = "#525252";
}

function changeCSS() {
  const imagePreviewContainer = document.getElementById("imagePreview");
  imagePreviewContainer.innerHTML = "";
  imagePreviewContainer.style.display = "grid";
  imagePreviewContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  imagePreviewContainer.style.gridTemplateRows = "repeat(2, 1fr)";
  imagePreviewContainer.style.flexDirection = "";
  imagePreviewContainer.style.border = "2px dashed #525252";
  imagePreviewContainer.style.gap = "0px";
  imagePreviewContainer.style.maxHeight = "150px";
  imagePreviewContainer.style.justifyItems = "center";
  imagePreviewContainer.style.alignItems = "center";
  imagePreviewContainer.style.border = "2px solid #525252";
  return imagePreviewContainer;
}
function updateImagePreview(files) {
  const imagePreviewContainer = changeCSS();
  const maxImagesToShow = 8;

  for (let i = 0; i < Math.min(files.length, maxImagesToShow); i++) {
    const file = files[i];
    const imgElement = document.createElement("img");
    imgElement.src = URL.createObjectURL(file);
    imgElement.onload = function () {
      URL.revokeObjectURL(this.src);
    };
    imagePreviewContainer.appendChild(imgElement);
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("collapsed");
  const toggleIcon = document.querySelector("#sidebarToggle i");
  if (sidebar.classList.contains("collapsed")) {
    toggleIcon.className = "fa fa-chevron-right";
  } else {
    toggleIcon.className = "fa fa-chevron-left";
  }
}
