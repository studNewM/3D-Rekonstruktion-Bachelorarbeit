import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default function load_threeJS(scene, url) {
    // instantiate a loader
    const loader = new OBJLoader();

    // load a resource
    loader.load('../assets', (gltfScene) => {

        scene.add(gltfScene);
    });
}

