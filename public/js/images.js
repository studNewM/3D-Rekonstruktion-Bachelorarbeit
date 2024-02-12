import { uploadImagesAndDisplayPreview } from "./axios.js";
import { initializeDragAndDrop } from "./dragAndDrop.js";
import { resetUI } from "./ui.js";

function handleSelectedFiles(event) {
  let selectedFiles;
  if (event.type === "drop") {
    selectedFiles = event.dataTransfer.files;
  } else {
    selectedFiles = event.target.files;
  }
  if (selectedFiles.length === 0) {
    alert("Bitte wählen Sie Dateien aus.");
    return;
  }

  if (!checkFileFormat(selectedFiles)) {
    alert("Dieses Dateiformat wird nicht unterstützt.\nBitte nutzen Sie eines der folgenden jpg, jpeg, png, tif, tiff, exr.");
    return;
  }
  blockForImageType(selectedFiles);
  const formData = new FormData();
  for (let i = 0; i < selectedFiles.length; i++) {
    formData.append("fileList", selectedFiles[i]);
  }
  uploadImagesAndDisplayPreview(formData, selectedFiles);
}
function blockForImageType(selectedFiles) {
  const value = Array.from(selectedFiles).every((file) =>
    /\.(jpg|png|jpeg)$/i.test(file.name),
  );
  if (!value) {
    const optionSelector = document.getElementById("modelSelector");
    const option = optionSelector.options[1]
    optionSelector.selectedIndex = 0
    option.disabled = true;
  }
}


function displaySelectedImages(selectedFiles) {
  const imagePreviewContainer = document.getElementById("uploadedImages");
  imagePreviewContainer.style.display = "grid";
  initializeDragAndDrop();
  window.totalImageCount = selectedFiles.length;
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];

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
    const closeIcon = document.createElement("img")
    closeIcon.src = "./img/trash-solid.svg"
    deleteBtn.appendChild(closeIcon)
    deleteBtn.id = "delete-btn";
    deleteBtn.onclick = function () {
      window.totalImageCount--;
      imagePreviewContainer.removeChild(wrapper);
      window.imagesMarkedForDeletion.push(
        wrapper.getAttribute("data-filename"),
      );
      if (window.totalImageCount === 0) {
        resetUI();
      }
    };
    wrapper.appendChild(deleteBtn);

    imagePreviewContainer.appendChild(wrapper);
  }
}
function checkFileFormat(selectedFiles) {
  return Array.from(selectedFiles).every((file) =>
    /\.(jpg|png|jpeg|tif|tiff|exr)$/i.test(file.name),
  );
}

export { handleSelectedFiles, displaySelectedImages };
