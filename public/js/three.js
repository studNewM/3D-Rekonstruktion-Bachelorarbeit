import * as THREE from "https://cdn.skypack.dev/three@0.128.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/TransformControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/MTLLoader.js";
import { PLYLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/PLYLoader.js";
import Stats from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/stats.module";
import * as dat from "/build/dat.gui.module.js";

const params = { color: "#ffffff" };
const gui = new dat.GUI();
gui.close();
gui.domElement.id = "gui";
gui.add;

const pointCloudFolder = gui.addFolder("PointCloud");
const meshFolder = gui.addFolder("Mesh");
const texturedMeshFolder = gui.addFolder("TexturedMesh");
pointCloudFolder.open();
meshFolder.open();
texturedMeshFolder.open();
let model_converter = 0;

const threejsContainer = document.getElementById("threeJsContainer");
const innerHeight = window.innerHeight / 1;
const innerWidth = window.innerWidth / 1;
const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const controls = initControls(camera, renderer);
const lights = initLights(scene);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    attachTransformControls(intersects[0].object);
  } else {
    detachTransformControls();
  }
}
window.addEventListener('click', onMouseClick, false);

let selectedObject = null;
const transformControls = new TransformControls(camera, renderer.domElement);

function attachTransformControls(object) {
  if (selectedObject !== object) {
    transformControls.attach(object);
    scene.add(transformControls);
    selectedObject = object;
  }
  transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value
  })
}

function detachTransformControls() {
  if (selectedObject) {
    transformControls.detach();
    selectedObject = null;
  }
}
// const transformControls = initTransformControls();
// function initTransformControls() {
//   const transformControls = new TransformControls(camera, renderer.domElement)
//   transformControls.setMode('rotate')
//   scene.add(transformControls)
//   return transformControls
// }
// transformControls.addEventListener('dragging-changed', function (event) {
//   controls.enabled = !event.value
// })
// window.addEventListener('keydown', function (event) {
//   switch (event.key) {
//     case 'g':
//       transformControls.setMode('translate')
//       break
//     case 'r':
//       transformControls.setMode('rotate')
//       break
//     case 's':
//       transformControls.setMode('scale')
//       break
//   }
// })
function clearMeshMemory(child) {
  debugger
  if (child.type === "Mesh" && child.geometry !== undefined || child.type === "Points") {
    child.geometry.dispose();
    child.geometry = undefined;
    if (child.type !== "Points" && child.parent.type !== "Group") {
      child.material.dispose();
    }
    child.material = undefined;
  }
}
function clearGroupMemory(child) {
  if (child instanceof THREE.Group) {
    child.children.forEach((element) => clearMeshMemory(element));
  }
}

function clearBoxHelperMemory(child) {
  debugger
  if (child instanceof THREE.BoxHelper) {
    child.geometry.dispose();
    child.geometry = undefined;
    child.material.dispose();
    child.material = undefined;
  }
}


export function clearScene() {
  removeFromGUI();
  const toRemove = [];
  scene.traverse(function (child) {
    // clearBoxHelperMemory(child);
    if (
      child instanceof THREE.Group ||
      child.type === "Mesh" ||
      child.type === "Points"
    ) {
      clearMeshMemory(child);
      clearGroupMemory(child);
      toRemove.push(child);
    }
    model_converter = 0;
  });

  for (var i = 0; i < toRemove.length; i++) {

    scene.remove(toRemove[i]);
  }
  camera.position.z = 1.5;
  camera.position.y = 1;
  camera.position.x = 0;
  controls.target.set(0, 0, 0);


}

initGridHelper(scene);
addLightToGui(lights, scene, params);
const helper = directionalLightHelper(scene, lights.directionalLight);
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
  threejsContainer.appendChild(renderer.domElement);
  return renderer;
}


function initLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.target.position.set(0, 0, 0);


  scene.add(ambientLight, directionalLight);
  return { ambientLight, directionalLight };
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
  const { ambientLight, directionalLight } = lights;

  const dirLightFolder = gui.addFolder("Directional Light");

  dirLightFolder
    .add(directionalLight, "visible")
    .name("Enabled")
    .onChange((value) => updateLightVisibility(directionalLight, value));
  dirLightFolder.add(directionalLight, "intensity", 0, 10, 0.01);
  dirLightFolder.add(directionalLight.position, "x", -10, 10);
  dirLightFolder.add(directionalLight.position, "y", -10, 10);
  dirLightFolder.add(directionalLight.position, "z", -10, 10);

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
  ambientLightFolder.open();
  backgroundFolder.open();

  return gui;
}
function guiHelperBox(folder, mesh) {
  const helperBox = new THREE.BoxHelper(mesh, 0xffffff);
  scene.add(helperBox);
  folder
    .add(helperBox, "visible")
    .name("HelperBox")
    .onChange((value) => {
      helperBox.visible = value;
    });
  folder.open();
}

function directionalLightHelper(scene, light) {
  const helper = new THREE.DirectionalLightHelper(light, 1);
  scene.add(helper);
  const box = gui.addFolder("DirectionalLightHelper Box");
  box
    .add(helper, "visible")
    .name("Enabled")
    .onChange((value) => {
      helper.visible = value;
    });
  box.open();
  return helper;
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
        camera.position.set(center.x + 2, center.y + 5, 5);

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
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());

            controls.target.copy(center);
            camera.position.set(center.x, 2, center.z + 2);
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
  const material = new THREE.MeshStandardMaterial();
  const objLoader = new OBJLoader();
  return new Promise((resolve, reject) => {
    objLoader.load(
      `/assets/${objName}`,
      (object) => {
        object.position.set(0, 0, 0);
        object.material = material
        scene.add(object);
        resolve(object);
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        console.log(center);

        controls.target.copy(center);
        camera.position.set(center.x, 2, center.z + 2);
      },
      undefined,
      reject,
    );
  });
}

async function loadColmapTextured(scene, objName) {
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
                debugger
                child.geometry.computeVertexNormals();
                child.geometry.center();

                const box = new THREE.Box3().setFromObject(child);
                const center = box.getCenter(new THREE.Vector3());
                child.geometry.computeBoundingBox();
                child.geometry.boundingBox.getCenter(center);
                child.localToWorld(center);
                controls.target.copy(center);

                camera.position.set(child.geometry.boundingBox.max.x + 5, child.geometry.boundingBox.max.y + 2, center.z);

                child.material.map = texture;
                child.material.needsUpdate = true;
              }
            });
            object.position.y = 2
            object.rotation.set((50 * Math.PI) / 180, 0, Math.PI);

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
        geometry.center();

        mesh.position.y = 2
        mesh.rotation.set((50 * Math.PI) / 180, 0, Math.PI);
        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(center);
        mesh.localToWorld(center);
        controls.target.copy(center);

        camera.position.set(geometry.boundingBox.max.x + 5, geometry.boundingBox.max.y + 2, center.z);

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
        const points = new THREE.Points(geometry, material);

        points.geometry.computeVertexNormals();
        points.geometry.center();

        points.position.y = 2
        points.rotation.set((50 * Math.PI) / 180, 0, Math.PI);
        scene.add(points);

        const box = new THREE.Box3().setFromObject(points);
        const center = box.getCenter(new THREE.Vector3());
        points.geometry.computeBoundingBox();
        points.geometry.boundingBox.getCenter(center);
        points.localToWorld(center);
        controls.target.copy(center);

        camera.position.set(geometry.boundingBox.max.x + 5, geometry.boundingBox.max.y + 2, center.z);


        resolve(points);
      },
      undefined,
      reject,
    );
  });
}

export async function loadModel(stepName, runType, path = "") {
  console.log(stepName);
  let runDict;
  let meshroomnameTypes;
  let colmapOpenMVSTypes;
  if (!path) {
    meshroomnameTypes = {
      StructureFromMotion: "cloud_and_poses.ply",
      Meshing: "mesh.obj",
      Publish: "texturedMesh.obj",
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
      Publish: path + "/texturedMesh.obj",
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
        break;
      case "Meshing":
        loadedObject = await loadMeshObject(scene, runDict[stepName]);

        break;
      case "Publish":
        loadedObject = await loadTexturedObject(
          scene,
          runDict[stepName],
          runDict[stepName].replace(".obj", ".mtl"),
        );
        break;
      case "model_converter":
        if (model_converter === 0) {
          loadedObject = await loadColmapPLY(scene, runDict[stepName]);
          model_converter += 1;
        }
        break;
      case "ReconstructMesh":
        loadedObject = await loadColmapMesh(scene, runDict[stepName]);

        break;
      case "TextureMesh":
        loadedObject = await loadColmapTextured(scene, runDict[stepName]);

        break;
      default:
        return;
    }
    addToGUI(loadedObject);
    transformControls.attach(loadedObject)
  } catch (error) {
    console.error("Fehler beim Laden des Modells:", error);
  }
}
function removeFromGUI() {
  debugger
  for (const folder of Object.keys(gui.__folders)) {
    if (folder === "PointCloud" || folder === "Mesh" || folder === "TexturedMesh") {
      const item = gui.__folders[folder];
      while (item.__controllers.length > 0) {
        item.remove(item.__controllers[0]);
      }
    }
  }
  debugger
}
function addToGUI(object) {
  if (object.type === "Points") {
    pointCloudFolder
      .add(object, "visible")
      .name("Enabled")
      .onChange((value) => object.visibility = value);
    pointCloudFolder.add(object.material, "size", 0.001, 0.01);
  }
  else if (object.type === "Group" && object.material === undefined) {
    texturedMeshFolder
      .add(object, "visible")
      .name("Enabled")
      .onChange((value) => object.visibility = value);
  } else if (object.type === "Mesh" || object.material.type === "MeshStandardMaterial") {
    meshFolder
      .add(object, "visible")
      .name("Enabled")
      .onChange((value) => object.visibility = value);
  }



}

function animate(camera, scene, renderer, controls) {
  requestAnimationFrame(() => animate(camera, scene, renderer, controls));
  helper.update()
  controls.update();
  renderer.render(scene, camera);

}
