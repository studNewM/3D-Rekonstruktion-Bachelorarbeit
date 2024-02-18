import { setupDragAndDrop } from "./dragAndDrop.js";
import { setupWebSocketConnection } from "./webSocket.js";
import {
  initializeReconstructionNodes,
  changeProgessNodes,
} from "./reconstruction.js";
import { resetUI } from "./ui.js";
import { initiateReconstructionProcess } from "./axios.js";
import { handleSelectedFiles } from "./images.js";
import { toggleSidebar } from "./ui.js";
window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});
window.totalImageCount = 0;
window.completedImageCount = 0;
window.imagesMarkedForDeletion = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeReconstructionNodes();
  setupEventListeners();
  setupWebSocketConnection();
});

function setupEventListeners() {
  document.getElementById("restart").addEventListener("click", resetUI);
  document
    .getElementById("startProcess")
    .addEventListener("click", initiateReconstructionProcess);
  document
    .getElementById("folderPicker")
    .addEventListener("change", handleSelectedFiles);
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", toggleSidebar);
  document
    .getElementById("modelSelector")
    .addEventListener("change", changeProgessNodes);
  setupDragAndDrop();
  setupTooltipListeners();
  setupDropdownListeners();
}

function setupTooltipListeners() {
  document.querySelectorAll(".tooltip").forEach(function (tooltip) {
    tooltip.addEventListener("mouseover", handleTooltipMouseover);
    tooltip.addEventListener("mouseout", handleTooltipMouseout);
  });
}

function handleTooltipMouseover(event) {
  if (!event.target.classList.contains("tooltiptext")) {
    this.querySelector(".tooltiptext").style.visibility = "visible";
  }
}

function handleTooltipMouseout() {
  this.querySelector(".tooltiptext").style.visibility = "hidden";
}

function setupDropdownListeners() {
  window.onclick = function (event) {
    if (!event.target.matches(".dropbtn")) {
      const dropdowns = document.getElementsByClassName("dropdown-content");
      for (const dropdown of dropdowns) {
        if (dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
        }
      }
    }
  };
}
window.addEventListener("load", function () {
  setTimeout(function open(event) {
    document.querySelector(".popup").style.display = "block";
  }, 1000);
});
document.querySelector("#close").addEventListener("click", function () {
  document.querySelector(".popup").style.display = "none";
  toggleSidebar();
});
