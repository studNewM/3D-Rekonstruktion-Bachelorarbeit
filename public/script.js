import { initModels } from './three.js';

const stepsByOption = {
    'Meshroom': ['CameraInit', 'FeatureExtraction', 'ImageMatching', 'FeatureMatching', 'StructureFromMotion', 'PrepareDenseScene', 'DepthMap', 'DepthMapFilter', 'Meshing', 'MeshFiltering', 'Texturing', 'Publish'],
    'Colmap/OpenMVS': ['feature_extractor', 'exhaustive_matcher', 'mapper', 'image_undistorter', 'model_converter', 'InterfaceCOLMAP', 'DensifyPointCloud', 'ReconstructMesh', 'RefineMesh', 'TextureMesh'],
};
let completedCount = 0;


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

        const progressLine = document.createElement('div');
        progressLine.classList.add('progressLine');
        progressLine.id = `progress-${stepName}-line`;

        step.appendChild(progressLine);
        progressContainer.appendChild(step);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    createProgressNodes();
    initializeWebSocket();

});

function setupEventListeners() {
    document.getElementById('startProcess').addEventListener('click', startReconstructionProcess);
    document.getElementById('folderPicker').addEventListener('change', handleFileSelection);
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('modelSelector').addEventListener('change', createProgressNodes);
    setupDragAndDrop();

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
            getFileDetails(formData);
            alert('Bilder erfolgreich hochgeladen!');
        })
        .catch(error => {
            console.error('Fehler beim Hochladen der Bilder:', error);
            alert('Fehler beim Hochladen der Bilder.');
        });
}

function getFileDetails(formData) {
    console.log(formData);
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
    imagePreviewContainer.style.border = '0px'

    const imagePreviewTitel = document.getElementById('imagePreviewTitel');
    imagePreviewTitel.innerHTML = 'Image Preview';
    imagePreviewTitel.style.padding = '0px';
    imagePreviewTitel.style.paddingBottom = '5px';


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



