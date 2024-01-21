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
let imagesToDelete = [];
let imageAmount = 0;

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
  setTimeout(() => {
    Three.loadModel(stepName, selectedOption);
  }, 2000);
}

function resetUIElements() {
  const elementsToClear = ["imageCount", "cameraDetails", "focalLength", "imageCountTooltip", "cameraTypesTooltip", "otherInfoTooltip"];
  elementsToClear.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = "";
      element.style.backgroundColor = "";
    }
  });

  const processElements = document.getElementsByClassName("progressLine");
  Array.from(processElements).forEach(elem => elem.style.backgroundColor = "white");
}


function createDropArea() {
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
  return dropArea;
}

document.getElementById("restart").addEventListener("click", () => resetUI());


function changeProgessNodes() {

  const selectedOption = document.getElementById("modelSelector").value;
  console.log(selectedOption);
  const meshroomNodes = document.getElementById("meshroomNodes");
  const colmapOpenMVSNodes = document.getElementById("colmapOpenMVSNodes");

  if (selectedOption !== "Meshroom") {
    meshroomNodes.style.display = "none";
    colmapOpenMVSNodes.style.display = "";
  } else if (selectedOption !== "Colmap/OpenMVS") {
    meshroomNodes.style.display = "";
    colmapOpenMVSNodes.style.display = "none";
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
function initializeNodes() {
  const items = [
    "StructureFromMotion",
    "Meshing",
    "Texturing",
    "model_converter",
    "ReconstructMesh",
    "TextureMesh",
  ]
  for (const item of items) {
    document
      .getElementById(`button-Anzeigen-${item}`)
      .addEventListener("click", () =>
        handleShowClick(`${item}`),
      );
    document
      .getElementById(`button-Export-${item}`)
      .addEventListener("click", () =>
        handleExportClick(`${item}`),
      );

    const utlButtons = document.getElementById(`ul-${item}`)
    utlButtons.onclick = () => showDropdown(`dropdown-${item}`);

  }
}



window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});
document.addEventListener("DOMContentLoaded", () => {
  initializeNodes();
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
    .addEventListener("change", changeProgessNodes);
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
  deleteImages();

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
function activateProgressBar(step) {
  var progressBar = document.getElementById(`progress-${step}-line`);
  progressBar.style.backgroundImage = 'linear-gradient(45deg, rgba(255, 255, 0, 0.65) 25%, transparent 25%, transparent 50%, rgba(255, 255, 0, 0.65) 50%, rgba(255, 255, 0, 0.65) 75%, transparent 75%, transparent)';
  progressBar.style.backgroundColor = '#f0bc00';
  progressBar.style.backgroundSize = '40px 40px';
  progressBar.style.animation = 'progress-bar-stripes 1s linear infinite';
}
function handleWebSocketMessage(event) {
  const data = JSON.parse(event.data);
  const processElement = document.getElementById(`progress-${data.step}-line`);
  const pipelineOptions = handleCheckboxChange();

  switch (data.status) {
    case "started":
      activateProgressBar(data.step);
      break;
    case "completed":
      completedCount++;
      if (processElement.style.backgroundColor !== "red") {
        processElement.style = ""
        processElement.style.backgroundColor = "green";
        processElement.style.height = "100%";
        processElement.style.width = "100%";
      }
      handleStepCompletion(data.step);
      activateButton(data.step);
      if (pipelineOptions["Zwischenergebnisse laden"] === true) {
        handleShowClick(data.step);
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


function initializeDragAndDrop() {
  let dropArea = document.getElementById('dropArea');
  const uploadedImages = document.getElementById('uploadedImages');
  const dropAreaStyle = getComputedStyle(dropArea).display;
  const uploadedImagesStyle = getComputedStyle(uploadedImages).display;

  if (dropAreaStyle === "flex" && uploadedImagesStyle === "grid") {
    dropArea.style.display = "none";
  } else if (dropAreaStyle === "flex" && uploadedImagesStyle === "none") {
    dropArea.style.display = "";
  } else if (dropAreaStyle === "none" && uploadedImagesStyle === "grid") {
    dropArea.style.display = "";
    uploadedImages.style.display = "none";
  } else {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.removeChild(dropArea);
    createDropArea();
    setupDragAndDrop();
  }

}

function resetUI() {
  Three.clearScene();
  completedCount = 0;
  imagesToDelete = [];
  const uploadedImagesContainer = document.getElementById("uploadedImages");
  uploadedImagesContainer.innerHTML = ''
  uploadedImagesContainer.style.display = 'none';
  const checkbox = document.getElementsByClassName("runOption");
  for (let item of checkbox) {
    item.disabled = false;
    item.checked = false;
  }
  const startButton = document.getElementById("startProcess");
  startButton.disabled = true;
  resetUIElements();
  initializeDragAndDrop();
}
document.querySelectorAll('.tooltip').forEach(function (tooltip) {
  tooltip.addEventListener('mouseover', function (event) {
    if (!event.target.classList.contains('tooltiptext')) {
      this.querySelector('.tooltiptext').style.visibility = 'visible';
    }
  });

  tooltip.addEventListener('mouseout', function () {
    this.querySelector('.tooltiptext').style.visibility = 'hidden';
  });
});

function updateImagePreview(files) {
  const imagePreviewContainer = document.getElementById("uploadedImages");
  imagePreviewContainer.style.display = "grid"
  initializeDragAndDrop();
  imageAmount = files.length;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const wrapper = document.createElement("div");
    wrapper.classList.add("image-wrapper");
    wrapper.id = `wrapper-${i}`;

    const imgElement = document.createElement("img");
    imgElement.src = URL.createObjectURL(file);
    imgElement.onload = function () {
      URL.revokeObjectURL(this.src);
    };
    wrapper.appendChild(imgElement);
    wrapper.setAttribute("data-filename", file.name);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "X";
    deleteBtn.id = "delete-btn";
    deleteBtn.onclick = function () {
      imageAmount--;
      imagePreviewContainer.removeChild(wrapper);
      imagesToDelete.push(wrapper.getAttribute("data-filename"));
      if (imageAmount === 0) {
        resetUI();
      }
    };
    wrapper.appendChild(deleteBtn);

    imagePreviewContainer.appendChild(wrapper);
  }
}
function deleteImages() {
  axios
    .post("/delete", { images: imagesToDelete })
    .then((response) => {
      console.log("Bilder gelöscht");
      imagesToDelete = [];
    })
    .catch((error) => {
      console.error("Fehler beim Löschen der Bilder", error);
    });
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
