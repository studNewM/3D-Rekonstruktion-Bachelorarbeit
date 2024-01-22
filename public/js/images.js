import { uploadImagesAndDisplayPreview } from "./axios.js";
import { initializeDragAndDrop } from "./dragAndDrop.js";
import { resetUI } from "./ui.js";

function handleselectedFileselection(event) {
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

  if (!areValidselectedFiles(selectedFiles)) {
    alert("Bitte wählen Sie nur .jpg oder .png Dateien.");
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < selectedFiles.length; i++) {
    formData.append("fileList", selectedFiles[i]);
  }
  uploadImagesAndDisplayPreview(formData, selectedFiles);
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
    deleteBtn.innerText = "X";
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
function areValidselectedFiles(selectedFiles) {
  return Array.from(selectedFiles).every((file) =>
    /\.(jpg|png|jpeg)$/i.test(file.name),
  );
}

export { handleselectedFileselection, displaySelectedImages };
