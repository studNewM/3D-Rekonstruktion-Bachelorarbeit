import * as THREE from 'three';
// import * as dat from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import load_threeJS from './load_modell';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


const innerHeight = window.innerHeight / 1;
const innerWidth = window.innerWidth / 1.5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
// scene.background = new THREE.Color('#ffffff');
camera.position.setZ(30);
camera.position.setX(-30);

const threeJsSection = document.getElementById('threeJsContainer');
threeJsSection.appendChild(renderer.domElement);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(50, 50, 50);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshBasicMaterial({ color: 0xff6347 });
// const torus = new THREE.Mesh(geometry, material);
// scene.add(torus);


// const gui = new dat.GUI();
// const materialParameter = {
//     cubeColor: torus.material.color.getHex(),
// }
// gui.addColor(materialParameter, 'cubeColor').onChange((value) => torus.material.color.set(value));
// gui.add(torus.material, 'wireframe');

// function createMaterial() {
//     // create a texture loader.
//     const textureLoader = new THREE.TextureLoader();

//     // load a texture
//     const texture = textureLoader.load(
//         '/assets/texture.jpg',
//     );

//     // create a "standard" material using
//     const material = new THREE.MeshStandardMaterial({
//         map: texture,
//     });
//     console.log(material)
//     return material;
// }
// document.getElementById('obj-file-input').addEventListener('change', function (event) {
//     const file = event.target.files[0];
//     if (file) {
//         loadObj(file);
//     }
// });


// function loadObj(file) {
//     const reader = new FileReader();
//     reader.readAsText(file);
//     reader.onload = function (event) {
//         const contents = event.target.result;
//         const object = new OBJLoader().parse(contents);
//         object.name = event.target.filename;
//         object.material = createMaterial();
//         scene.add(object);
//     };
// }
// const textureLoader = new THREE.TextureLoader();
// const material = new THREE.MeshBasicMaterial({
//     map: textureLoader.load('/assets/texture.jpg'), // Pfad zur Textur
// });

// const loader = new OBJLoader();
// loader.load(
//     '../assets/model.obj', // Pfad zum OBJ-Modell
//     (object) => {
//         object.traverse(function (child) {
//             if (child instanceof THREE.Mesh) {
//                 child.material = material;
//                 object.rotation.x = Math.PI;

//             }
//         });
//         scene.add(object);
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     (error) => {
//         console.error('An error happened', error);
//     }
// );




function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);

}
animate();


