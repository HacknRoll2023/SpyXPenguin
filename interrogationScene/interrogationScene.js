// Three.js ------------------------------------------------------------
import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Scene
let threeCamera, scene, renderer;
var sceneLoaded = false;

var numOfClicks = 0;

// Models
var penguin, fortress;

const captionContainer = document.getElementById("captionContainer");
const nextButton = document.getElementById("next");
const caption = document.getElementById("caption");

function initThree() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    threeCamera.position.set(2, 1, 3);
    threeCamera.zoom = 3;

    setTimeout(() => {
        // replace with game loop later
        render();
    }, 1000);

    // rotate camera to face the penguin
    threeCamera.zoom = 0.5;

    scene = new THREE.Scene();

    // Load the background
    new RGBELoader().setPath("./../textures/equirectangular/").load("kloppenheim_06_puresky_2k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        /*           // // load in red, green and blue cubes for orientation -----------------------------
          const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green
          const cube1 = new THREE.Mesh(geometry, material);
          cube1.position.set(1, 1.2, 1);
          scene.add(cube1);
  
          const geometry2 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
          const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red
          const cube2 = new THREE.Mesh(geometry2, material2);
          cube2.position.set(1.2, 1, 1);
          scene.add(cube2);
  
          const geometry3 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
          const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // blue
          const cube3 = new THREE.Mesh(geometry3, material3);
          cube3.position.set(2, 2, 0.2);
          scene.add(cube3); */
        render();

        // load in models ---------------------------------------------------------------
        // model set up
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("../jsm/libs/draco/");

        const loader = new GLTFLoader().setPath("../models/");
        loader.setDRACOLoader(dracoLoader);

        // Penguin model
        loader.load("holdingknife.glb", function (gltf) {
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.16, 0.16, 0.16);
            penguin.position.set(0.75, 0.45, 2);
            //penguin.rotation.set(0, (-10 / 180) * Math.PI, 0);
            scene.add(penguin);
            threeCamera.lookAt(penguin.position);

            setTimeout(() => {
                loadCaptionContainer();
            }, 1000);
        });

        // Add fortress model for target destination
        loader.load("IceFortressInhabited.gltf", function (gltf) {
            console.log(gltf);
            fortress = gltf.scene;
            fortress.scale.set(0.2, 0.2, 0.2);
            //fortress.position.set(targetPosition.x, 0.4, targetPosition.z);
            fortress.rotation.set(0, (-10 - 90 / 180) * Math.PI, 0);
            scene.add(fortress);
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
    // controls
    const controls = new OrbitControls(threeCamera, renderer.domElement);
    controls.addEventListener("change", render); // use if there is no animation loop
    controls.minDistance = 0.2;
    controls.maxDistance = 10;
    controls.target.set(0, 0.25, 0);
    controls.update();

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
            caption.innerHTML = "Seal: I.. I.. I don't know!";
            //threeCamera.position.x -=1.3;
            //threeCamera.position.z += 0.5;
            threeCamera.updateProjectionMatrix();
            render();
            break;
        case 2:
            caption.innerHTML = "Penguin: You don't know? Are you sure you don't know?";
            threeCamera.lookAt(penguin.position.x, penguin.position.y, penguin.position.z);
            render();
            break;
        case 3:
            caption.innerHTML = "Seal: Uhh he's in the forest behind the fortress.";
            break;
        default:
            location.href = "../findSonScene/findSon.html";
            break;
    }
});
