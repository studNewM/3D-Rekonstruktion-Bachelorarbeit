// import * as THREE from 'three';
// // import * as dat from 'dat.gui';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// // import load_threeJS from './load_modell';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
const stepsByOption = {
    'Meshroom': [
        'CameraInit', 'DepthMap', 'DepthMapFilter', 'FeatureExtraction',
        'FeatureMatching', 'ImageMatching', 'MeshFiltering', 'Meshing',
        'PrepareDenseScene', 'Publish', 'StructureFromMotion', 'Texturing'
    ],
    'Colmap/OpenMVS': ['feature_extractor', 'exhaustive_matcher', 'mapper', 'image_undistorter', 'model_converter', 'InterfaceCOLMAP', 'DensifyPointCloud', 'ReconstructMesh', 'RefineMesh', 'TextureMesh'],
};


document.getElementById('startProcess').addEventListener('click', function () {
    const selectedOption = document.getElementById('modelSelector').value;
    const steps = stepsByOption[selectedOption] || [];

    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '';

    steps.forEach((stepName) => {
        const step = document.createElement('div');
        step.classList.add('progressStep');
        step.textContent = stepName;

        const progressLine = document.createElement('div');
        progressLine.classList.add('progressLine');

        step.appendChild(progressLine);
        progressContainer.appendChild(step);
    });

    // const ws = new WebSocket('ws://localhost:3000');

    // ws.onopen = function () {
    //     console.log("WebSocket-Verbindung geöffnet");

    //     axios.post('/model/reconstruction')
    //         .then(function (response) {
    //             console.log(response);
    //         })
    //         .catch(function (error) {
    //             console.log(error);
    //         });
    // };

    // ws.onmessage = function (event) {

    //     const output = document.getElementById('output');
    //     const newLogEntry = document.createElement('p');
    //     newLogEntry.textContent = event.data;
    //     output.appendChild(newLogEntry);

    //     output.scrollTop = output.scrollHeight;
    // };

    // ws.onerror = function (error) {
    //     console.error('WebSocket-Fehler:', error);
    // };

    // ws.onclose = function () {
    //     console.log("WebSocket-Verbindung geschlossen");
    // };
});

document.getElementById('uploadButton').addEventListener('click', function () {
    const folderInput = document.getElementById('folderPicker');
    const files = folderInput.files;

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
            alert('Dateien erfolgreich hochgeladen!');
        })
        .catch(error => {
            console.error('Fehler beim Hochladen der Dateien:', error);
            alert('Fehler beim Hochladen der Dateien.');
        });
});




// const innerHeight = window.innerHeight / 1;
// const innerWidth = window.innerWidth / 1.5;

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
// const renderer = new THREE.WebGLRenderer();
// const controls = new OrbitControls(camera, renderer.domElement);

// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(innerWidth, innerHeight);
// // scene.background = new THREE.Color('#ffffff');
// camera.position.setZ(30);
// camera.position.setX(-30);

// const threeJsSection = document.getElementById('threeJsContainer');
// threeJsSection.appendChild(renderer.domElement);

// const pointLight = new THREE.PointLight(0xffffff);
// pointLight.position.set(50, 50, 50);

// const ambientLight = new THREE.AmbientLight(0xffffff);
// scene.add(pointLight, ambientLight);

// // Helpers
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// scene.add(directionalLight);


// function animate() {
//     requestAnimationFrame(animate);

//     controls.update();
//     renderer.render(scene, camera);

// }
// animate();


