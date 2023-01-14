import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// initialise variables for handtracking
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// hide the video element, and just show the canvas
videoElement.style.display = "none";

const digitPositions = document.getElementsByClassName("digit-position__value");

// Scene
let camera, scene, renderer;

// Models
var fish, penguin, island, rod, bobber, alertModel, seal, babySeal;

var spaceCount = 0;

let animationId = null;

init();
render();

function init() {
    //
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(1, 0.3, 0);
    // rotate camera to face the penguin
    camera.lookAt(2, 2, 2);

    scene = new THREE.Scene();
    const clock = new THREE.Clock();

    // Load the background
    new RGBELoader().setPath("./../textures/equirectangular/").load("snowy_hillside_02_4k.hdr", function (texture) {
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

        // FishingIsland model
        const glbPathIsland = "FishingIsland.gltf";
        loader.load(glbPathIsland, function (gltf) {
            island = gltf.scene;
            island.scale.set(0.1, 0.1, 0.1);
            island.position.set(1, -0.1, 0.3);
            island.rotation.set(0, 90, 0);
            scene.add(island);
        });

        // Penguin model
        const glbPath = "hangingBaby.glb";
        loader.load(glbPath, function (gltf) {
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.06, 0.06, 0.06);
            penguin.position.set(0.08, 0.02, 0.03);
            penguin.rotation.y = (-10/180)  * Math.PI;
            //penguin.setRotation(0, (-10 / 180) * Math.PI, 0);
            scene.add(penguin);
            
            swingPenguin(2);
        });

        
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
    controls.target.set(0, 0.25, 0);
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

// animate baby penguin
function swingPenguin(time) {
    const speed = 0.001;
    time *= 0.001; // convert time param to seconds
    penguin.rotation.x += time * speed;
    penguin.rotation.y += time * speed;

    const frequency = 0.00002;
    const acceleration = -penguin.rotation.z * frequency;
    penguin.speed += acceleration;
    //penguin.position.x += time * penguin.speed;
    // Render the scene to canvas
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(swingPenguin);
}

// Game mechanics ---------------------------------------------------------------
// Get user input from keyboard
document.addEventListener("keydown", (event) => {
    const keyName = event.key;

    if (keyName === " ") {
        spaceCount++;

        if (spaceCount > 1) {
            //document.getElementById("instruction1").innerHTML = "Let's go borrow a fishing rod from Mr. Seal!";
        }

        if (spaceCount > 2) {
            //window.location.href = "./MrSealScene.html";
        }
    }
});

function onResults(results) {
    // Mirror the video feed and draw the results on the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: "#FF0000",
                lineWidth: 2,
            });
        }
    }

    canvasCtx.restore();

    // wrist - 0
    // thumb tip - 4
    // index tip - 8
    // middle tip - 12
    // ring tip - 16
    // pinky tip - 20

    //   display the coordinates of the tips of the fingers for each hand
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandedness.length; i++) {
            const classification = results.multiHandedness[i];
            const isRightHand = classification.label === "Right";
            const digitPosition = isRightHand ? digitPositions[0] : digitPositions[1];
            digitPosition.innerText = `
                    Thumb: [${results.multiHandLandmarks[i][4].x.toFixed(2)}, ${results.multiHandLandmarks[i][4].y.toFixed(2)}]
                    Index: [${results.multiHandLandmarks[i][8].x.toFixed(2)}, ${results.multiHandLandmarks[i][8].y.toFixed(2)}]
                    Middle: [${results.multiHandLandmarks[i][12].x.toFixed(2)}, ${results.multiHandLandmarks[i][12].y.toFixed(2)}]
                    Ring: [${results.multiHandLandmarks[i][16].x.toFixed(2)}, ${results.multiHandLandmarks[i][16].y.toFixed(2)}]
                    Pinky: [${results.multiHandLandmarks[i][20].x.toFixed(2)}, ${results.multiHandLandmarks[i][20].y.toFixed(2)}]
                `;

            // zoom in and out
            if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
                //console.log("zoom out");
                camera.zoom = 0.5;
                camera.updateProjectionMatrix();
                render();
            } else {
                // pinch action
                //console.log("zoom in");
                camera.zoom = 2;
                camera.updateProjectionMatrix();
                render();
            }
        }
    }
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const webcam = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
});

webcam.start();

document.getElementById("reset").addEventListener("click", resetCamera());

function resetCamera() {
    console.log("reset");
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    render();
}
