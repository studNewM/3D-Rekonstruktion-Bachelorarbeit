const stepsByOption = {
    'Meshroom': ['CameraInit', 'DepthMap', 'DepthMapFilter', 'FeatureExtraction', 'FeatureMatching', 'ImageMatching', 'MeshFiltering', 'Meshing', 'PrepareDenseScene', 'Publish', 'StructureFromMotion', 'Texturing'],
    'Colmap/OpenMVS': ['feature_extractor', 'exhaustive_matcher', 'mapper', 'image_undistorter', 'model_converter', 'InterfaceCOLMAP', 'DensifyPointCloud', 'ReconstructMesh', 'RefineMesh', 'TextureMesh'],
};
document.addEventListener('DOMContentLoaded', () => {
    createProgressNodes();
});

document.getElementById('startProcess').addEventListener('click', function () {
    let completedCount = 0;
    const startButton = document.getElementById('startProcess');
    startButton.disabled = true;
    console.log("ISt disabled: ");

    const selectedOption = document.getElementById('modelSelector').value;


    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = function () {
        console.log("WebSocket-Verbindung geöffnet");
        console.log("option: ", selectedOption);

        axios.post('/model/reconstruction', {
            model: selectedOption
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const processElement = document.getElementById(`progress-${data.step}-line`);
        if (processElement) {
            if (data.status === 'started') {
                processElement.style.backgroundColor = 'yellow';
            } else if (data.status === 'completed') {
                processElement.style.backgroundColor = 'green';
                completedCount++;
                if (selectedOption == "Colmap/OpenMVS" && completedCount >= 5) {
                    startButton.disabled = false;
                    completedCount = 0;
                }
                else if (selectedOption == "Meshroom" && completedCount >= 12) {
                    startButton.disabled = false;
                    completedCount = 0;
                }
            }
        }
    };

    ws.onerror = function (error) {
        console.error('WebSocket-Fehler:', error);
    };

    ws.onclose = function () {
        console.log("WebSocket-Verbindung geschlossen");
    };
});

document.getElementById('folderPicker').addEventListener('change', function () {
    const files = this.files;

    if (files.length === 0) {
        alert('Bitte wählen Sie einen Ordner aus.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('fileList', files[i]);
    }

    axios.post('/image/upload', formData)
        .then(response => {
            console.log(response.data);
            alert('Bilder erfolgreich hochgeladen!');
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
});
document.getElementById('sidebarToggle').addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
    const toggleIcon = document.querySelector('#sidebarToggle i');
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fa fa-chevron-right';
    } else {
        toggleIcon.className = 'fa fa-chevron-left';
    }
});



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

document.getElementById('modelSelector').addEventListener('change', function () {
    createProgressNodes();
});



