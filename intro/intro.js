// Three.js ------------------------------------------------------------
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Scene
let threeCamera, scene, renderer, textureLoader, animationId;
var sceneLoaded = false;

var numOfClicks = 0;

// Models
var penguin, telephone;

const captionContainer = document.getElementById("captionContainer");
const nextButton = document.getElementById("next");
const caption = document.getElementById("caption");
const audio = document.getElementById("bgm");

function initThree() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.click;
    audio.play();

    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    threeCamera.position.set(2, 1, 3);

    setTimeout(() => {
        // replace with game loop later
        render();
        loadCaptionContainer();
    }, 1000);

    // rotate camera to face the penguin
    threeCamera.zoom = 0.5;

    scene = new THREE.Scene();

    // Load the background
    new RGBELoader().setPath("./../textures/equirectangular/").load("kloppenheim_06_puresky_2k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        render();

        // load in models ---------------------------------------------------------------
        // model set up
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("../jsm/libs/draco/");

        const loader = new GLTFLoader().setPath("../models/");
        loader.setDRACOLoader(dracoLoader);

        // Penguin model
        loader.load("Penguin.gltf", function (gltf) {
            penguin = gltf.scene;
            penguin.scale.set(0.16, 0.16, 0.16);
            penguin.position.set(0.75, 0.45, 2);
            //penguin.rotation.set(0, (-10 / 180) * Math.PI, 0);
            scene.add(penguin);
            threeCamera.lookAt(penguin.position);

            setTimeout(() => {
                spin(2);
                render();
            }, 1000);
        });

        // Telephone model
        loader.load("telephone.glb", function (gltf) {
            telephone = gltf.scene;
            telephone.position.set(0, 0.45, 1);
            scene.add(telephone);
            telephone.visible = false;
        });

        var groundTexture = new THREE.TextureLoader().load("./../textures/textureImages/snowTexture3.jpg");
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
    threeCamera.lookAt(0, 0, 0);
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

initThree();
render();

function loadCaptionContainer() {
    captionContainer.style.display = "block";
}

nextButton.addEventListener("click", () => {
    numOfClicks++;
    switch (numOfClicks) {
        case 1:
            caption.innerHTML = "riiiiiiiiiiiiiiiiiiiing";
            telephone.visible = true; 
            threeCamera.zoom = 1.5;
            threeCamera.updateProjectionMatrix();
            cancelAnimationFrame(animationId);
            penguin.rotation.y = Math.PI * 2;
            render();
            break;
        case 2:
            caption.innerHTML = "Penguin: Hello?";
            threeCamera.lookAt(penguin.position.x, penguin.position.y, penguin.position.z);
            render();
            break;
        case 3:
            caption.innerHTML = "Seal: Give us fishes... Or your son is NEVER coming back.";
            break;
        default:
            location.href = "../FishingScene/FishingScene.html"; 
            break;
    }
});

function spin(time) {
    time *= 0.001; // convert time param to seconds
    penguin.rotation.y = time;
    // Render the scene to canvas
    renderer.render(scene, threeCamera);
    animationId = requestAnimationFrame(spin);
}