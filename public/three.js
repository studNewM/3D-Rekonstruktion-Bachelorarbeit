import * as THREE from "https://cdn.skypack.dev/three@0.128.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/MTLLoader.js";
import { PLYLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/PLYLoader.js";
import Stats from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/stats.module";
import * as dat from "/build/dat.gui.module.js";

const params = { color: "#ffffff" };
const gui = new dat.GUI();

gui.close();
gui.domElement.id = "gui";
const objectsFolder = gui.addFolder("3dObjects");
gui.add;
objectsFolder.open();
let model_converter = 0;

const threeJsSection = document.getElementById("threeJsContainer");
const innerHeight = window.innerHeight / 1;
const innerWidth = window.innerWidth / 1;
const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const controls = initControls(camera, renderer);
const lights = initLights(scene);

export function clearScene() {
  var to_remove = [];

  scene.traverse(function (child) {
    console.log(child);
    if (child instanceof THREE.Group || child.type === "Mesh" || child.type === "Points") {
      to_remove.push(child);
    }
    model_converter = 0;
  });

  for (var i = 0; i < to_remove.length; i++) {
    scene.remove(to_remove[i]);
    removeFromGUI();
  }
}

// const stats = initStats();
initGridHelper(scene);
addLightToGui(lights, scene, params);
animate(camera, scene, renderer, controls);

function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(params.color);
  return scene;
}

function initCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
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
function initLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);

  scene.add(ambientLight, directionalLight, pointLight);
  return { ambientLight, directionalLight, pointLight };
}

function initControls(camera, renderer) {
  return new OrbitControls(camera, renderer.domElement);
}

function initGridHelper(scene) {
  const size = 10;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);
}

function initStats() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  return stats;
}

function updateLightVisibility(light, visibility) {
  light.visible = visibility;
}

function addLightToGui(lights, scene, params) {
  const { ambientLight, directionalLight, pointLight } = lights;

  const dirLightFolder = gui.addFolder("Directional Light");
  dirLightFolder
    .add(directionalLight, "visible")
    .name("Enabled")
    .onChange((value) => updateLightVisibility(directionalLight, value));
  dirLightFolder.add(directionalLight, "intensity", 0, 2, 0.01);
  dirLightFolder.add(directionalLight.position, "x", -10, 10);
  dirLightFolder.add(directionalLight.position, "y", -10, 10);
  dirLightFolder.add(directionalLight.position, "z", -10, 10);

  const pointLightFolder = gui.addFolder("Point Light");
  pointLightFolder
    .add(pointLight, "visible")
    .name("Enabled")
    .onChange((value) => updateLightVisibility(pointLight, value));
  pointLightFolder.add(pointLight, "intensity", 0, 2, 0.01);
  pointLightFolder.add(pointLight.position, "x", -10, 10);
  pointLightFolder.add(pointLight.position, "y", -10, 10);
  pointLightFolder.add(pointLight.position, "z", -10, 10);

  const ambientLightFolder = gui.addFolder("Ambient Light");
  ambientLightFolder
    .add(ambientLight, "visible")
    .name("Enabled")
    .onChange((value) => updateLightVisibility(ambientLight, value));
  ambientLightFolder.add(ambientLight, "intensity", 0, 10, 0.01);

  const backgroundFolder = gui.addFolder("Background");
  backgroundFolder
    .addColor(params, "color")
    .onChange((value) => scene.background.set(value));

  dirLightFolder.open();
  pointLightFolder.open();
  ambientLightFolder.open();
  backgroundFolder.open();

  return gui;
}

function guiHelperBox(scene, mesh) {
  const helperBox = new THREE.BoxHelper(mesh, 0xffffff);
  scene.add(helperBox);
  const box = gui.addFolder("Helper Box");
  box
    .add(helperBox, "visible")
    .name("Enabled")
    .onChange((value) => {
      helperBox.visible = value;
    });
  box.open();
}

async function loadPly(scene, plyName) {
  const plyloader = new PLYLoader();

  return new Promise((resolve, reject) => {
    plyloader.load(
      `/assets/${plyName}`,
      (geometry) => {
        const material = new THREE.PointsMaterial({
          size: 0.01,
          vertexColors: THREE.VertexColors,
        });
        const mesh = new THREE.Points(geometry, material);
        mesh.rotateX(Math.PI);
        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());

        controls.target.copy(center);

        camera.position.set(center.x, 3, center.z + 5);
        resolve(mesh);
      },
      undefined,
      reject,
    );
  });
}

async function loadTexturedObject(scene, objName, mtlName) {
  const mtlLoader = new MTLLoader();
  return new Promise((resolve, reject) => {
    mtlLoader.load(
      `/assets/${mtlName}`,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          `/assets/${objName}`,
          (object) => {
            object.position.set(0, 0, 0);
            scene.add(object);
            resolve(object);
          },
          undefined,
          reject,
        );
      },
      undefined,
      reject,
    );
  });
}

async function loadMeshObject(scene, objName) {
  const objLoader = new OBJLoader();
  return new Promise((resolve, reject) => {
    objLoader.load(
      `/assets/${objName}`,
      (object) => {
        object.position.set(0, 0, 0);
        scene.add(object);
        resolve(object);
      },
      undefined,
      reject,
    );
  });
}

async function loadColmapTextued(scene, objName) {
  const textureLoader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    textureLoader.load(
      "/assets/model_material_0_map_Kd.jpg",
      (texture) => {
        const objLoader = new OBJLoader();
        objLoader.load(
          `/assets/${objName}`,
          (object) => {
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.computeFaceNormals();
                child.geometry.computeVertexNormals();

                child.material.map = texture;
                child.material.needsUpdate = true;
              }
            });

            object.position.set(0, 7, 0);
            object.rotation.set(40, 0, 0);

            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());

            controls.target.copy(center);
            camera.position.set(center.x, 3, center.z + 5);

            scene.add(object);
            resolve(object);
          },
          undefined,
          reject,
        );
      },
      undefined,
      reject,
    );
  });
}
async function loadColmapMesh(scene, plyName) {
  const plyLoader = new PLYLoader();

  return new Promise((resolve, reject) => {
    plyLoader.load(
      `/assets/${plyName}`,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial();

        const mesh = new THREE.Mesh(geometry, material);

        geometry.computeVertexNormals();

        mesh.position.set(0, 7, 0);
        mesh.rotation.set(40, 0, 0);

        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());

        controls.target.copy(center);
        camera.position.set(center.x, 3, center.z + 5);

        resolve(mesh);
      },
      undefined,
      reject,
    );
  });
}

async function loadColmapPLY(scene, plyName) {
  const plyloader = new PLYLoader();

  return new Promise((resolve, reject) => {
    plyloader.load(
      `/assets/${plyName}`,
      (geometry) => {
        const material = new THREE.PointsMaterial({
          size: 0.01,
          vertexColors: THREE.VertexColors,
        });
        const mesh = new THREE.Points(geometry, material);

        mesh.geometry.computeVertexNormals();
        mesh.position.set(0, 7, 0);
        mesh.rotation.set(40, 0, 0);
        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());

        controls.target.copy(center);

        camera.position.set(center.x, 3, center.z + 5);
        resolve(mesh);
      },
      undefined,
      reject,
    );
  });
}

export async function loadModel(stepName, runType, path = "") {
  let runDict;
  let meshroomnameTypes;
  let colmapOpenMVSTypes;
  if (!path) {
    meshroomnameTypes = {
      StructureFromMotion: "cloud_and_poses.ply",
      Meshing: "mesh.obj",
      Texturing: "texturedMesh.obj",
    };
    colmapOpenMVSTypes = {
      model_converter: "sfm.ply",
      ReconstructMesh: "model_dense_mesh.ply",
      TextureMesh: "model.obj",
    };
  } else {
    meshroomnameTypes = {
      StructureFromMotion: path + "/cloud_and_poses.ply",
      Meshing: path + "/mesh.obj",
      Texturing: path + "/texturedMesh.obj",
    };
    colmapOpenMVSTypes = {
      model_converter: "sfm.ply",
      ReconstructMesh: "model_dense_mesh.ply",
      TextureMesh: "model.obj",
    };
  }
  if (!stepName) {
    return;
  }
  if (runType === "Meshroom") {
    runDict = meshroomnameTypes;
  } else if (runType === "Colmap/OpenMVS") {
    runDict = colmapOpenMVSTypes;
  }

  try {
    let loadedObject;
    switch (stepName) {
      case "StructureFromMotion":
        loadedObject = await loadPly(scene, runDict[stepName]);
        // guiHelperBox(scene, loadedObject);
        break;
      case "Meshing":
        loadedObject = await loadMeshObject(scene, runDict[stepName]);
        break;
      case "Texturing":
        loadedObject = await loadTexturedObject(
          scene,
          runDict[stepName],
          runDict[stepName].replace(".obj", ".mtl"),
        );
        break;
      case "model_converter":
        if (model_converter === 0) {
          loadedObject = await loadColmapPLY(scene, runDict[stepName]);
          // guiHelperBox(scene, loadedObject);
          model_converter += 1;
        }
        break;
      case "ReconstructMesh":
        loadedObject = await loadColmapMesh(scene, runDict[stepName]);
        break;
      case "TextureMesh":
        loadedObject = await loadColmapTextued(scene, runDict[stepName]);
        break;
      default:
        return;
    }
    addToGUI(loadedObject, stepName);
  } catch (error) {
    console.error("Fehler beim Laden des Modells:", error);
  }
}
function removeFromGUI() {
  while (objectsFolder.__controllers.length > 0) {
    objectsFolder.remove(objectsFolder.__controllers[0]);
  }
}
function addToGUI(object, name) {
  objectsFolder
    .add(object, "visible")
    .name(name)
    .onChange((value) => {
      object.visible = value;
    });
}

function animate(camera, scene, renderer, controls) {
  requestAnimationFrame(() => animate(camera, scene, renderer, controls));
  controls.update();
  // stats.update();
  renderer.render(scene, camera);
}
