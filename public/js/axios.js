import { handleCheckboxChange } from "./reconstruction.js";
import { displayMetadata } from "./metaData.js";
import { displaySelectedImages } from "./images.js";

function toggleButtonState(buttonId, disable) {
  const button = document.getElementById(buttonId);
  button.disabled = disable;
}

/*
 * Initialisiert den Rekonstruktionsprozess durch das Senden der ausgewählten Optionen an den Server
 */
async function initiateReconstructionProcess() {
  toggleButtonState("startProcess", true);
  const selectedModel = document.getElementById("modelSelector").value;
  const pipelineOptions = handleCheckboxChange();
  await deleteImages();

  try {
    await axios.post("/reconstruction", {
      model: selectedModel,
      options: pipelineOptions,
    });
  } catch (error) {
    console.error(error);
  }
}

/*
 * Schickt die Liste der Bilder, die zum Löschen markiert wurden, an den Server
 */
async function deleteImages() {
  try {
    await axios.post("/delete", { images: window.imagesMarkedForDeletion });
    window.imagesMarkedForDeletion = [];
  } catch (error) {
    handleAxiosError(error, "Fehler beim Löschen der Bilder");
  }
}

/*
 * Holt die Metadaten der Bilder vom Server
 */
async function fetchMetadata() {
  try {
    const response = await axios.get("/metadata");
    displayMetadata(response.data);
  } catch (error) {
    handleAxiosError(error, "Fehler beim Extrahieren der Metadaten");
  }
}

/*
 * Schickt die Bilder an den Server und zeigt sie in der Vorschau an
 */
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

/*
 * Behandelt Fehler, die bei der Kommunikation mit dem Server auftreten
 */
function handleAxiosError(error, errorMessage) {
  console.error(errorMessage, error);
  alert(errorMessage);
}

export { initiateReconstructionProcess, uploadImagesAndDisplayPreview };
