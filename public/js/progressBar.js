function activateProgressBar(step) {
  var progressBar = document.getElementById(`progress-${step}-line`);
  progressBar.style.backgroundImage =
    "linear-gradient(45deg, rgba(255, 255, 0, 0.65) 25%, transparent 25%, transparent 50%, rgba(255, 255, 0, 0.65) 50%, rgba(255, 255, 0, 0.65) 75%, transparent 75%, transparent)";
  progressBar.style.backgroundColor = "#f0bc00";
  progressBar.style.backgroundSize = "40px 40px";
  progressBar.style.animation = "progress-bar-stripes 1s linear infinite";
}
function handleProcessCompletion(stepName) {
  const selectedModel = document.getElementById("modelSelector").value;
  if (
    (selectedModel === "Colmap/OpenMVS" && window.completedImageCount >= 11) ||
    (selectedModel === "Meshroom" && stepName === "Publish")
  ) {
    document.getElementById("startProcess").disabled = false;
    window.completedImageCount = 0;
    alert("Prozess abgeschlossen!");
  }
}

export { activateProgressBar, handleProcessCompletion };
