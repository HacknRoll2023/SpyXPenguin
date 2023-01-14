import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Loaders
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader().setPath("../models/");

// Scene
let camera, scene, renderer;

// Models
var island;

// To update values and text on html
let updateFishCount = document.getElementById("updatefish");
let updateTime = document.getElementById("updatetime");

init();
render();

function init() {
    const container = document.createElement("div");
    document.getElementById("fishingscene").appendChild(container);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.25,
        20
    );
    camera.position.set(1, 1, 4);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    // Load the background
    new RGBELoader()
        .setPath("./../textures/equirectangular/")
        .load("kloppenheim_06_puresky_2k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        render();

        // load in models ---------------------------------------------------------------
        // model set up
        dracoLoader.setDecoderPath("../jsm/libs/draco/");
        loader.setDRACOLoader(dracoLoader);

        // FishingIsland model
        const glbPathIsland = "FishingSceneIntro.gltf";
        loader.load(glbPathIsland, function (gltf) {
            island = gltf.scene;
            island.scale.set(0.3, 0.3, 0.3);
            island.rotation.set(0, (-90 / 180) * Math.PI, 0);
            scene.add(island);
        });

        // const axes = new THREE.AxesHelper(5);
        // scene.add(axes);
        });

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use if there is no animation loop
    controls.minDistance = 0.2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controls.update();

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    renderer.render(scene, camera);
}
