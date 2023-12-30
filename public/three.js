import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/MTLLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/stats.module';
import * as dat from '/build/dat.gui.module.js';

const params = { color: '#ffffff' };

function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(params.color);
    return scene;
}

function initCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 1.5;
    camera.position.y = 1;
    return camera;
}

function initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    renderer.physicallyCorrectLights = true;
    threeJsSection.appendChild(renderer.domElement);
    return renderer;
}

function initGridHelper(scene) {
    const size = 10;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
}

function initControls(camera, renderer) {
    return new OrbitControls(camera, renderer.domElement);
}

function initStats() {
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    return stats;
}


function loadObject(scene) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/assets/texturedMesh.mtl', (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('/assets/texturedMesh.obj', (object) => {
            object.position.set(0, 0, 0);
            scene.add(object);
        });
    });
}

function initLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);

    scene.add(ambientLight, directionalLight, pointLight);

    return { ambientLight, directionalLight, pointLight };
}

function createGUI(camera, lights, scene, params) {
    const gui = new dat.GUI();
    gui.close()
    gui.domElement.id = 'gui';
    const { ambientLight, directionalLight, pointLight } = lights;

    const dirLightFolder = gui.addFolder('Directional Light');
    dirLightFolder.add(directionalLight, 'visible').name('Enabled').onChange((value) => updateLightVisibility(directionalLight, value));
    // dirLightFolder.addColor(directionalLight, 'color');
    dirLightFolder.add(directionalLight, 'intensity', 0, 2, 0.01);
    dirLightFolder.add(directionalLight.position, 'x', -10, 10);
    dirLightFolder.add(directionalLight.position, 'y', -10, 10);
    dirLightFolder.add(directionalLight.position, 'z', -10, 10);

    const pointLightFolder = gui.addFolder('Point Light');
    pointLightFolder.add(pointLight, 'visible').name('Enabled').onChange((value) => updateLightVisibility(pointLight, value));
    // pointLightFolder.addColor(pointLight, 'color');
    pointLightFolder.add(pointLight, 'intensity', 0, 2, 0.01);
    pointLightFolder.add(pointLight.position, 'x', -10, 10);
    pointLightFolder.add(pointLight.position, 'y', -10, 10);
    pointLightFolder.add(pointLight.position, 'z', -10, 10);

    const ambientLightFolder = gui.addFolder('Ambient Light');
    ambientLightFolder.add(ambientLight, 'visible').name('Enabled').onChange((value) => updateLightVisibility(ambientLight, value));
    // ambientLightFolder.addColor(ambientLight, 'color');
    ambientLightFolder.add(ambientLight, 'intensity', 0, 10, 0.01);

    const backgroundFolder = gui.addFolder('Background');
    backgroundFolder.addColor(params, 'color').onChange((value) => scene.background.set(value));

    dirLightFolder.open();
    pointLightFolder.open();
    ambientLightFolder.open();
    backgroundFolder.open();
}


function updateLightVisibility(light, visibility) {
    light.visible = visibility;
}

function animate(camera, scene, renderer, controls) {
    requestAnimationFrame(() => animate(camera, scene, renderer, controls));
    controls.update();
    // stats.update();
    renderer.render(scene, camera);
}

export function initModels() {
    loadObject(scene)
}
const threeJsSection = document.getElementById('threeJsContainer');
const innerHeight = window.innerHeight / 1;
const innerWidth = window.innerWidth / 1;

const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const controls = initControls(camera, renderer);
const lights = initLights(scene);
// const stats = initStats();
createGUI(camera, lights, scene, params);
initGridHelper(scene);

// animate(camera, scene, renderer, controls, stats);
animate(camera, scene, renderer, controls);