import * as Three from "./three.js";
import { initializeDragAndDrop } from "./dragAndDrop.js";

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
function clearMetadataDisplay() {
  const elementsToClear = [
    "imageCount",
    "cameraDetails",
    "focalLength",
    "imageCountTooltip",
    "cameraTypesTooltip",
    "otherInfoTooltip",
  ];
  elementsToClear.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = "";
      element.style.backgroundColor = "";
    }
  });

  const processElements = document.getElementsByClassName("progress-bar");
  Array.from(processElements).forEach(
    (elem) => (elem.style.backgroundColor = "white"),
  );
}
function resetUI() {
  Three.clearScene();
  window.completedImageCount = 0;
  window.imagesMarkedForDeletion = [];
  const uploadedImagesContainer = document.getElementById("uploadedImages");
  uploadedImagesContainer.innerHTML = "";
  uploadedImagesContainer.style.display = "none";
  const checkbox = document.getElementsByClassName("runOption");
  for (let item of checkbox) {
    item.disabled = false;
    item.checked = false;
  }
  const startButton = document.getElementById("startProcess");
  startButton.disabled = true;
  clearMetadataDisplay();
  initializeDragAndDrop();
}

export { toggleSidebar, resetUI };
