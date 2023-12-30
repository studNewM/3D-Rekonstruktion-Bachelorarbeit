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
});

function setupEventListeners() {
    document.getElementById('startProcess').addEventListener('click', startReconstructionProcess);
    document.getElementById('folderPicker').addEventListener('change', handleFileSelection);
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('modelSelector').addEventListener('change', createProgressNodes);
}
function startReconstructionProcess() {
    const startButton = document.getElementById('startProcess');
    startButton.disabled = true;

    const selectedOption = document.getElementById('modelSelector').value;
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = handleWebSocketOpen(selectedOption);
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = function (error) {
        console.error('WebSocket-Fehler:', error);
    };
    ws.onclose = function () {
        console.log("WebSocket-Verbindung geschlossen");
    };
}
function handleWebSocketOpen(selectedOption) {
    return function () {
        console.log("WebSocket-Verbindung geöffnet");
        axios.post('/reconstruction', {
            model: selectedOption
        }).then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }
}
function handleWebSocketMessage(event) {
    const startButton = document.getElementById('startProcess');
    const selectedOption = document.getElementById('modelSelector').value;
    const data = JSON.parse(event.data);
    const processElement = document.getElementById(`progress-${data.step}-line`);
    if (processElement) {
        if (data.status === 'started') {
            processElement.style.backgroundColor = 'yellow';
        } else if (data.status === 'completed') {
            completedCount++;
            processElement.style.backgroundColor = 'green';
            if (selectedOption == "Colmap/OpenMVS" && completedCount >= 20) {
                console.log("object");
                startButton.disabled = false;
                completedCount = 0;
            }
            else if (selectedOption == "Meshroom" && data.step == 'Publish' && data.status === 'completed') {
                startButton.disabled = false;
                completedCount = 0;
                console.log("Prozess abgeschlossen!");
                alert('Prozess abgeschlossen!');
                initModels();
            }
        }
    }
}

function handleFileSelection() {
    const files = this.files;

    if (files.length === 0) {
        alert('Bitte wählen Sie einen Ordner aus.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('fileList', files[i]);
    }

    axios.post('/upload', formData)
        .then(response => {
            console.log(response.data);
            alert('Bilder erfolgreich hochgeladen!');
            document.getElementById('startProcess').disabled = false;
        })
        .catch(error => {
            console.error('Fehler beim Hochladen der Bilder:', error);
            alert('Fehler beim Hochladen der Bilder.');
        });

    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';

    const maxImagesToShow = 6;
    for (let i = 0; i < Math.min(this.files.length, maxImagesToShow); i++) {
        const file = this.files[i];
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


function initializeWebSocket() {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onopen = handleWebSocketOpen;
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = handleWebSocketError;
    ws.onclose = handleWebSocketClose;
    return ws;
}


function handleWebSocketError(error) {
    console.error('WebSocket-Fehler:', error);
}

function handleWebSocketClose() {
    console.log("WebSocket-Verbindung geschlossen");
}

const ws = initializeWebSocket();