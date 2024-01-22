function displayMetadata(metadata) {
  const imageCount = document.getElementById("imageCount");
  imageCount.innerText = metadata.totalImages;

  const cameraMakersInfo = metadata.cameras
    .map((camera) => camera.maker)
    .join("|");
  const cameraDetails = document.getElementById("cameraDetails");
  cameraDetails.innerText = cameraMakersInfo;

  const focalLengthsInfo = metadata.cameras
    .map((camera) => camera.focalLengths)
    .flat()
    .join("|");
  const focalLengths = document.getElementById("focalLength");
  focalLengths.innerText = focalLengthsInfo;

  updateTooltips(metadata);
}

function updateTooltips(cameraInfo) {
  let imageCountContent = "";
  let cameraTypesContent = "";
  let otherInfoContent = "";

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

export { displayMetadata };
