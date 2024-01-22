import { handleCheckboxChange } from "./reconstruction.js";
import { displayMetadata } from "./metaData.js";
import { displaySelectedImages } from "./images.js";
function toggleButtonState(buttonId, disable) {
  const button = document.getElementById(buttonId);
  button.disabled = disable;
}
async function initiateReconstructionProcess() {
  toggleButtonState("startProcess", true);
  const selectedModel = document.getElementById("modelSelector").value;
  const pipelineOptions = handleCheckboxChange();
  await deleteImages();

  try {
    const response = await axios.post("/reconstruction", {
      model: selectedModel,
      options: pipelineOptions,
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
async function deleteImages() {
  try {
    await axios.post("/delete", { images: window.imagesMarkedForDeletion });
    console.log("Bilder gelöscht");
    window.imagesMarkedForDeletion = [];
  } catch (error) {
    handleAxiosError(error, "Fehler beim Löschen der Bilder");
  }
}
async function fetchMetadata() {
  try {
    const response = await axios.get("/metadata");
    console.log("Metadaten extrahiert");
    displayMetadata(response.data);
  } catch (error) {
    handleAxiosError(error, "Fehler beim Extrahieren der Metadaten");
  }
}
async function uploadImagesAndDisplayPreview(formData, selectedFiles) {
  try {
    await axios.post("/upload", formData);
    displaySelectedImages(selectedFiles);
    toggleButtonState("startProcess", false);
    alert("Bilder erfolgreich hochgeladen!");
    await fetchMetadata();
  } catch (error) {
    handleAxiosError(error, "Fehler beim Hochladen der Bilder");
  }
}
function handleAxiosError(error, errorMessage) {
  console.error(errorMessage, error);
  alert(errorMessage);
}

export { initiateReconstructionProcess, uploadImagesAndDisplayPreview };
