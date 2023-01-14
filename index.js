// Three.js ------------------------------------------------------------
import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Scene
let threeCamera, scene, renderer;
var sceneLoaded = false;

var penguin;

function visitPage() {
    window.location = "index.html";
}

function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    //audio.play();

    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    threeCamera.position.set(-1.2, 0.3, -0.2);
    // rotate camera to face the penguin
    threeCamera.lookAt(0, 0.3, 0);

    setTimeout(() => {
        // replace with game loop later
        render();
    }, 1000);

    scene = new THREE.Scene();

    // Load the background
    new RGBELoader().setPath("./textures/equirectangular/").load("kloppenheim_06_puresky_2k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;
        render();

        // load in models ---------------------------------------------------------------
        // model set up
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("./jsm/libs/draco/");

        const loader = new GLTFLoader().setPath("./models/");
        loader.setDRACOLoader(dracoLoader);

        // Penguin model
        loader.load("spyxpenguin.gltf", function (gltf) {
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.1, 0.1, 0.1);
            penguin.position.set(0, 0, 0);
            penguin.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
            scene.add(penguin);

            setTimeout(() => {
                render();
            }, 1000);
        });

        var groundTexture = new THREE.TextureLoader().load("./textures/textureImages/snowTexture3.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(10000, 10000);
        groundTexture.anisotropy = 64;
        groundTexture.encoding = THREE.sRGBEncoding;

        var groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
        });

        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), groundMaterial);
        mesh.position.y = 0;
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize);
 

    sceneLoaded = true;
}

function onWindowResize() {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    renderer.render(scene, threeCamera);
}

init();
render();
