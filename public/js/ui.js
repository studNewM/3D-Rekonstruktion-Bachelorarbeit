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

/*
 * Löschung der Metadatenanzeige
 */
function clearMetaDataDisplay() {
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
    (element) => (element.style.backgroundColor = "white"),
  );
}

/*
 * Löschung der HTML-Elemente
 */
function clearHtmlElements() {
  window.completedImageCount = 0;
  window.imagesMarkedForDeletion = [];
  const uploadedImagesContainer = document.getElementById("uploadedImages");
  uploadedImagesContainer.innerHTML = "";
  uploadedImagesContainer.style.display = "none";
  const startButton = document.getElementById("startProcess");
  startButton.disabled = true;
  const optionSelector = document.getElementById("modelSelector");
  optionSelector.selectedIndex = 0;
  const checkbox = document.getElementsByClassName("runOption");
  checkbox[0].disabled = true;
  checkbox[1].disabled = false;
  for (let item of checkbox) {
    item.checked = false;
  }
}

/*
 * Setzt die UI zurück, löscht die Szene
 */
function resetUI() {
  Three.clearScene();
  clearHtmlElements();
  clearMetaDataDisplay();
  initializeDragAndDrop();
}

export { toggleSidebar, resetUI };
