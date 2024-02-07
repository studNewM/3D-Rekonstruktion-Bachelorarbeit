import * as Three from "./three.js";


function handleCheckboxChange() {
  const checkbox = document.getElementsByClassName("runOption");
  for (let item of checkbox) {
    item.disabled = true;
  }
  const selectedModel = {
    [checkbox[0].labels[0].title]: checkbox[0].checked,
    [checkbox[1].labels[0].innerHTML]: checkbox[1].checked,
  };
  return selectedModel;
}
function changeProgessNodes() {
  const selectedModel = document.getElementById("modelSelector").value;
  const meshroomNodesElement = document.getElementById("meshroomNodes");
  const colmapOpenMVSNodesElement =
    document.getElementById("colmapOpenMVSNodes");

  if (selectedModel !== "Meshroom") {
    meshroomNodesElement.style.display = "none";
    colmapOpenMVSNodesElement.style.display = "";
    const checkbox = document.getElementsByClassName("runOption");
    checkbox[0].disabled = false;

  } else if (selectedModel !== "Colmap/OpenMVS") {
    meshroomNodesElement.style.display = "";
    colmapOpenMVSNodesElement.style.display = "none";
    const checkbox = document.getElementsByClassName("runOption");
    checkbox[0].checked = false
    checkbox[0].disabled = true;
  }
}

function initializeReconstructionNodes() {
  const items = [
    "StructureFromMotion",
    "Meshing",
    "Texturing",
    "model_converter",
    "ReconstructMesh",
    "TextureMesh",
  ];
  for (const item of items) {
    document
      .getElementById(`button-Anzeigen-${item}`)
      .addEventListener("click", () => triggerDisplayAction(`${item}`));
    document
      .getElementById(`button-Export-${item}`)
      .addEventListener("click", () => triggerExportAction(`${item}`));

    const utlButtons = document.getElementById(`ul-${item}`);
    utlButtons.onclick = () => toggleDropdownDisplay(`dropdown-${item}`);
  }
}

function toggleDropdownDisplay(id) {
  document.getElementById(id).classList.toggle("show");
}
function enableReconstructionButtons(process) {
  const buttons = ["Anzeigen", "Export"].map((action) =>
    document.getElementById(`button-${action}-${process}`),
  );
  buttons.forEach((button) => {
    if (button) {
      button.classList.remove("disabled");
    }
  });
}
function triggerDisplayAction(stepName) {
  const selectedModel = document.getElementById("modelSelector").value;
  setTimeout(() => {
    Three.loadModel(stepName, selectedModel);
  }, 100);
}
function triggerExportAction(stepName) {
  console.log(`Export für Schritt ${stepName} ausgelöst.`);
}

export {
  handleCheckboxChange,
  changeProgessNodes,
  initializeReconstructionNodes,
  enableReconstructionButtons,
  triggerDisplayAction,
  triggerExportAction
};
