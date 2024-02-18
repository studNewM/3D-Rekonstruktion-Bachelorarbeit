function displayMetadata(metadata) {
  const imageCount = document.getElementById("imageCount");
  imageCount.innerText = metadata.totalImages;

  const cameraMakersInfo = metadata.cameras[0] !== "Unbekannt"
    ? metadata.cameras
      .map((camera) => camera.maker)
      .join("|")
    : "Unbekannt";
  debugger
  const cameraDetails = document.getElementById("cameraDetails");
  cameraDetails.innerText = cameraMakersInfo;

  const focalLengthsInfo = metadata.cameras[0] !== "Unbekannt" ? metadata.cameras
    .map((camera) => camera.focalLengths)
    .flat()
    .join("|") : "Unbekannt";
  const focalLengths = document.getElementById("focalLength");
  focalLengths.innerText = focalLengthsInfo;
  updateTooltips(metadata);
}

function updateMetadata(amount) {
  const imageCount = document.getElementById("imageCount");
  imageCount.innerText = amount;
}

/*
 * Aktualisiert die Tooltips für die Kamera Informationen
 */
function updateTooltips(cameraInfo) {
  let imageCountContent = "";
  let cameraTypesContent = "";
  let otherInfoContent = "";
  if (cameraInfo.totalCameras !== "Unbekannt") {
    for (const camera of cameraInfo.cameras) {
      imageCountContent += `${camera.maker}:<br>`;
      for (const [focalLength, count] of Object.entries(
        camera.imageCountsByFocalLength,
      )) {
        imageCountContent += `&nbsp;&nbsp;${focalLength}: ${count} Bild(er)<br>`;
      }
      imageCountContent += "<br>";
      cameraTypesContent += `${camera.combine}<br>`;
      otherInfoContent += `Kamera: ${camera.combine}, ISO: ${camera.isoValues.join(", ")}, Brennweiten: ${camera.focalLengths.join(", ")}<br>`;
    }
  } else
    [
      (imageCountContent += `Unbekannt:<br>${cameraInfo.totalImages} Bild(er)<br><br>`),
      (cameraTypesContent += `Unbekannt<br>`),
      (otherInfoContent += `Kamera: Unbekannt, ISO: Unbekannt, Brennweiten: Unbekannt<br>`),
    ];

  const imagecount = document.getElementById("imageCountTooltip");
  imagecount.innerHTML = imageCountContent;
  imagecount.style.backgroundColor = "#525252";

  const cameraTypes = document.getElementById("cameraTypesTooltip");
  cameraTypes.innerHTML = cameraTypesContent;
  cameraTypes.style.backgroundColor = "#525252";

  const otherInfo = document.getElementById("otherInfoTooltip");
  otherInfo.innerHTML = otherInfoContent;
  otherInfo.style.backgroundColor = "#525252";
}

export { displayMetadata, updateMetadata };
