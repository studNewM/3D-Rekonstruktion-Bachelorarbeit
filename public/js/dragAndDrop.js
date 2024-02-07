import { handleSelectedFiles } from "./images.js";

function createDropArea() {
  const dropArea = document.createElement("div");
  dropArea.id = "dropArea";
  dropArea.className = "drop-area";

  const uploadIconElement = document.createElement("i");
  uploadIconElement.className = "fa fa-upload";
  uploadIconElement.id = "upload_icon";

  const dragDropText = document.createElement("p");
  dragDropText.innerHTML = "Drag & Drop Ihre Dateien hier <br />";

  const fileInputLabel = document.createElement("label");
  fileInputLabel.className = "file-input-label";
  fileInputLabel.htmlFor = "folderPicker";
  fileInputLabel.textContent = "oder klicken Sie, um Dateien auszuwählen";

  dragDropText.appendChild(fileInputLabel);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "folderPicker";
  fileInput.setAttribute("webkitdirectory", "");
  fileInput.multiple = true;
  fileInput.style.display = "none";

  dropArea.appendChild(uploadIconElement);
  dropArea.appendChild(dragDropText);
  dropArea.appendChild(fileInput);

  imagePreview.appendChild(dropArea);
  return dropArea;
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
    handleSelectedFiles(event);
  });
}
function initializeDragAndDrop() {
  let dropArea = document.getElementById("dropArea");
  const uploadedImages = document.getElementById("uploadedImages");
  const dropAreaDisplayStyle = getComputedStyle(dropArea).display;
  const uploadedImagesDisplayStyle = getComputedStyle(uploadedImages).display;

  if (
    dropAreaDisplayStyle === "flex" &&
    uploadedImagesDisplayStyle === "grid"
  ) {
    dropArea.style.display = "none";
  } else if (
    dropAreaDisplayStyle === "flex" &&
    uploadedImagesDisplayStyle === "none"
  ) {
    dropArea.style.display = "";
  } else if (
    dropAreaDisplayStyle === "none" &&
    uploadedImagesDisplayStyle === "grid"
  ) {
    dropArea.style.display = "";
    uploadedImages.style.display = "none";
  } else {
    const imagePreview = document.getElementById("imagePreview");
    imagePreview.removeChild(dropArea);
    createDropArea();
    setupDragAndDrop();
  }
}

export { initializeDragAndDrop, setupDragAndDrop };
