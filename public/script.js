import { initModels } from './three.js';

const stepsByOption = {
    'Meshroom': ['CameraInit', 'FeatureExtraction', 'ImageMatching', 'FeatureMatching', 'StructureFromMotion', 'PrepareDenseScene', 'DepthMap', 'DepthMapFilter', 'Meshing', 'MeshFiltering', 'Texturing', 'Publish'],
    'Colmap/OpenMVS': ['feature_extractor', 'exhaustive_matcher', 'mapper', 'image_undistorter', 'model_converter', 'InterfaceCOLMAP', 'DensifyPointCloud', 'ReconstructMesh', 'RefineMesh', 'TextureMesh'],
};
let completedCount = 0;
function activateButton(process) {
    const buttons = ['Anzeigen', 'Export'].map(action => document.getElementById(`button-${action}-${process}`));
    buttons.forEach(button => {
        if (button) {
            button.classList.remove('disabled');
        }
    });
}


function handleExportClick(stepName) {
    console.log(`Export für Schritt ${stepName} ausgelöst.`);
    // Fügen Sie hier die Logik für die Export-Funktion ein
}

function handleShowClick(stepName) {
    alert(`Anzeigen für Schritt ${stepName} ausgelöst.`);
    // axios.post('/model', {
    //     step: stepName
    // }).then(function (response) {
    //     console.log(response);
    // }).catch(function (error) {
    //     console.log(error);
    // });
}


// Working for all Nodes

// function createProgressNodes() {
//     const selectedOption = document.getElementById('modelSelector').value;
//     const steps = stepsByOption[selectedOption] || [];

//     const progressContainer = document.getElementById('progressContainer');
//     progressContainer.innerHTML = '';

//     steps.forEach((stepName) => {
//         const step = document.createElement('div');
//         step.classList.add('progressStep');
//         step.textContent = stepName;
//         step.id = `process-${stepName}`;


//         const dropdown = document.createElement('div');
//         dropdown.classList.add('dropdown');
//         const dropbtn = document.createElement('ul');
//         dropbtn.classList.add('dropbtn', 'icons', 'btn-right', 'showLeft');
//         dropbtn.onclick = () => showDropdown(`dropdown-${stepName}`);

//         for (let i = 0; i < 3; i++) {
//             dropbtn.appendChild(document.createElement('li'));
//         }

//         dropdown.appendChild(dropbtn);

//         const dropdownContent = document.createElement('div');
//         dropdownContent.classList.add('dropdown-content');
//         dropdownContent.id = `dropdown-${stepName}`;
//         ['Export'].forEach(text => {
//             const button = document.createElement('button');
//             button.textContent = text;
//             button.classList.add('dropdown-btn', 'disabled');
//             dropdownContent.appendChild(button);
//         });

//         if (['StructureFromMotion', 'Meshing', 'Texturing'].includes(stepName)) {
//             const specialButton = document.createElement('button');
//             specialButton.textContent = 'Anzeigen';
//             specialButton.classList.add('dropdown-btn', 'disabled');
//             dropdownContent.appendChild(specialButton);
//         }

//         dropdown.appendChild(dropdownContent);
//         step.appendChild(dropdown);
//         const progressLine = document.createElement('div');
//         progressLine.classList.add('progressLine');
//         progressLine.id = `progress-${stepName}-line`;


//         step.appendChild(progressLine);
//         progressContainer.appendChild(step);
//     });
// }
function createProgressNodes() {
    const selectedOption = document.getElementById('modelSelector').value;
    const steps = stepsByOption[selectedOption] || [];

    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '';

    steps.forEach((stepName) => {
        const step = document.createElement('div');
        step.classList.add('progressStep');
        step.textContent = stepName;
        step.id = `process-${stepName}`;

        // Erstellen des Dropdown-Menüs nur für spezifizierte Schritte
        if (['StructureFromMotion', 'Meshing', 'Texturing'].includes(stepName)) {
            const dropdown = document.createElement('div');
            dropdown.classList.add('dropdown');
            const dropbtn = document.createElement('ul');
            dropbtn.classList.add('dropbtn', 'icons', 'btn-right', 'showLeft');
            dropbtn.onclick = () => showDropdown(`dropdown-${stepName}`);

            for (let i = 0; i < 3; i++) {
                dropbtn.appendChild(document.createElement('li'));
            }

            dropdown.appendChild(dropbtn);

            const dropdownContent = document.createElement('div');
            dropdownContent.classList.add('dropdown-content');
            dropdownContent.id = `dropdown-${stepName}`;

            ['Anzeigen', 'Export'].forEach(text => {
                const button = document.createElement('button');
                button.textContent = text;
                button.id = `button-${text}-${stepName}`;
                button.classList.add('dropdown-btn', 'disabled');
                dropdownContent.appendChild(button);
            });

            dropdown.appendChild(dropdownContent);
            step.appendChild(dropdown);
        }

        const progressLine = document.createElement('div');
        progressLine.classList.add('progressLine');
        progressLine.id = `progress-${stepName}-line`;
        step.appendChild(progressLine);

        progressContainer.appendChild(step);
    });
}
function showDropdown(id) {
    document.getElementById(id).classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});
document.addEventListener('DOMContentLoaded', () => {
    createProgressNodes();
    setupEventListeners();
    initializeWebSocket();

});

function setupEventListeners() {
    document.getElementById('startProcess').addEventListener('click', startReconstructionProcess);
    document.getElementById('folderPicker').addEventListener('change', handleFileSelection);
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('modelSelector').addEventListener('change', createProgressNodes);
    setupDragAndDrop();


    document.getElementById('button-Export-StructureFromMotion').addEventListener('click', () => handleExportClick('StructureFromMotion'));
    document.getElementById('button-Export-Meshing').addEventListener('click', () => handleExportClick('Meshing'));
    document.getElementById('button-Export-Texturing').addEventListener('click', () => handleExportClick('Texturing'));

    document.getElementById('button-Anzeigen-StructureFromMotion').addEventListener('click', () => handleShowClick('StructureFromMotion'));
    document.getElementById('button-Anzeigen-Meshing').addEventListener('click', () => handleShowClick('Meshing'));
    document.getElementById('button-Anzeigen-Texturing').addEventListener('click', () => handleShowClick('Texturing'));
}


function initializeWebSocket() {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onopen = handleWebSocketOpen;
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = handleWebSocketError;
    ws.onclose = handleWebSocketClose;
}

function handleWebSocketOpen() {
    console.log("WebSocket-Verbindung geöffnet");
}

function handleWebSocketError(error) {
    console.error('WebSocket-Fehler:', error);
}

function handleWebSocketClose() {
    console.log("WebSocket-Verbindung geschlossen");
}
function setupDragAndDrop() {
    const dropArea = document.getElementById('dropArea');
    dropArea.addEventListener('dragover', event => event.preventDefault());
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', event => {
        event.preventDefault();
        dropArea.classList.remove('drag-over');
        handleFileSelection(event);
    });
}

function areValidFiles(files) {
    return Array.from(files).every(file => /\.(jpg|png)$/i.test(file.name));
}

function startReconstructionProcess() {
    const startButton = document.getElementById('startProcess');
    startButton.disabled = true;

    const selectedOption = document.getElementById('modelSelector').value;

    axios.post('/reconstruction', {
        model: selectedOption
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log(error);
    });
}

function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    const processElement = document.getElementById(`progress-${data.step}-line`);

    switch (data.status) {
        case 'started':
            processElement.style.backgroundColor = 'yellow';
            break;
        case 'completed':
            completedCount++;
            processElement.style.backgroundColor = 'green';
            handleStepCompletion(data.step);
            activateButton(data.step);
            break;
        case 'failed':
            processElement.style.backgroundColor = 'red';
            alert(`${data.step} fehlgeschlagen:\n${data.message}`);
            break;
        default:
            console.warn('Unbekannter Status:', data.status);
    }
}

function handleStepCompletion(stepName) {
    const selectedOption = document.getElementById('modelSelector').value;
    if ((selectedOption === "Colmap/OpenMVS" && completedCount >= 20) || (selectedOption === "Meshroom" && stepName === 'Publish')) {
        document.getElementById('startProcess').disabled = false;
        completedCount = 0;
        alert('Prozess abgeschlossen!');
        if (selectedOption === "Meshroom") {
            initModels();
        }
    }
}


function handleFileSelection(event) {

    let files;
    if (event.type === 'drop') {
        files = event.dataTransfer.files;
    } else {
        files = event.target.files;
    }

    if (files.length === 0) {
        alert('Bitte wählen Sie Dateien aus.');
        return;
    }

    if (!areValidFiles(files)) {
        alert('Bitte wählen Sie nur .jpg oder .png Dateien.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('fileList', files[i]);
    }
    axios.post('/upload', formData)
        .then(response => {
            console.log(response.data);
            updateImagePreview(files);
            document.getElementById('startProcess').disabled = false;
            alert('Bilder erfolgreich hochgeladen!');
            getFileDetails();
        })
        .catch(error => {
            console.error('Fehler beim Hochladen der Bilder:', error);
            alert('Fehler beim Hochladen der Bilder.');
        });
}

function getFileDetails() {
    axios.get('/metadata')
        .then(response => {
            console.log("Metadaten extrahiert");
            displayMetadata(response.data);
        })
        .catch(error => {
            console.error('Fehler beim Extrahieren der Metadaten', error);
        });
}

function displayMetadata(metadata) {
    const imageCount = document.getElementById('imageCount');
    imageCount.innerText = metadata.totalImages;

    const cameraInfos = metadata.cameras.map(camera => camera.maker).join('|');
    const cameraDetails = document.getElementById('cameraDetails');
    cameraDetails.innerText = cameraInfos;

    const focalLengthsDetails = metadata.cameras.map(camera => camera.focalLengths).flat().join('|');
    const focalLengths = document.getElementById('focalLength');
    focalLengths.innerText = focalLengthsDetails;

    updateTooltips(metadata);
}
function updateTooltips(cameraInfo) {
    let imageCountTooltipContent = '';
    let cameraTypesTooltipContent = '';
    let otherInfoTooltipContent = '';


    console.log(cameraInfo);

    for (const camera of cameraInfo.cameras) {
        imageCountTooltipContent += `${camera.maker}:<br>`;
        for (const [focalLength, count] of Object.entries(camera.imageCountsByFocalLength)) {
            imageCountTooltipContent += `&nbsp;&nbsp;${focalLength}: ${count} Bild(er)<br>`;
        }
        imageCountTooltipContent += '<br>';
        cameraTypesTooltipContent += `${camera.combine}<br>`;
        otherInfoTooltipContent += `Kamera: ${camera.combine}, ISO: ${camera.isoValues.join(', ')}, Brennweiten: ${camera.focalLengths.join(', ')}<br>`;
    }

    const imagecount = document.getElementById('imageCountTooltip')
    imagecount.innerHTML = imageCountTooltipContent;
    imagecount.style.backgroundColor = '#525252';

    const cameraTypes = document.getElementById('cameraTypesTooltip');
    cameraTypes.innerHTML = cameraTypesTooltipContent;
    cameraTypes.style.backgroundColor = '#525252';

    const otherInfo = document.getElementById('otherInfoTooltip');
    otherInfo.innerHTML = otherInfoTooltipContent;
    otherInfo.style.backgroundColor = '#525252';

}


function changeCSS() {
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';
    imagePreviewContainer.style.display = 'grid';
    imagePreviewContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    imagePreviewContainer.style.gridTemplateRows = 'repeat(2, 1fr)';
    imagePreviewContainer.style.flexDirection = '';
    imagePreviewContainer.style.border = '2px dashed #525252';
    imagePreviewContainer.style.gap = '0px';
    imagePreviewContainer.style.maxHeight = '150px';
    imagePreviewContainer.style.justifyItems = 'center';
    imagePreviewContainer.style.alignItems = 'center';
    imagePreviewContainer.style.border = '2px solid #525252'
    return imagePreviewContainer;

}
function updateImagePreview(files) {
    const imagePreviewContainer = changeCSS();
    const maxImagesToShow = 8;

    for (let i = 0; i < Math.min(files.length, maxImagesToShow); i++) {
        const file = files[i];
        const imgElement = document.createElement('img');
        imgElement.src = URL.createObjectURL(file);
        imgElement.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreviewContainer.appendChild(imgElement);
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
    const toggleIcon = document.querySelector('#sidebarToggle i');
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fa fa-chevron-right';
    } else {
        toggleIcon.className = 'fa fa-chevron-left';
    }
}



