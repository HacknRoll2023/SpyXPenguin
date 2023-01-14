import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// initialise variables for handtracking
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const resetButton = document.getElementById("reset");
const instructions = document.getElementById("instructions");
const closeButton = document.getElementById("close");
const success = document.getElementById("success");

resetButton.addEventListener("click", resetCamera);

closeButton.addEventListener("click", () => {
    instructions.style.display = "none";
    resetButton.style.display = "block";
    gameHasStarted = true;
});

function resetCamera() {
    console.log("reset");
    camera.zoom = 1;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    render();
}

// hide the video element, and just show the canvas
videoElement.style.display = "none";

const digitPositions = document.getElementsByClassName("digit-position__value");

// Scene
let camera, scene, renderer, clock;

// Models
var tree, penguin;

var spaceCount = 0;

// Game state
var foundPenguin = false,
    gameHasStarted = false;

init();
render();

function init() {
    const container = document.createElement("div");
    const audio = document.getElementById("bgm");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(10, 5, 8);

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Load the background
    new RGBELoader().setPath("./../textures/equirectangular/").load("snowy_hillside_02_4k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;
        audio.play();
        render();

        // load in models ---------------------------------------------------------------
        // model set up
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("../jsm/libs/draco/");

        const loader = new GLTFLoader().setPath("../models/");
        loader.setDRACOLoader(dracoLoader);

        // Tree model
        loader.load("HangingTree.gltf", function (gltf) {
            console.log(gltf);
            tree = gltf.scene;
            tree.scale.set(0.02, 0.02, 0.02);
            tree.position.set(0, 0, 0);
            scene.add(tree);
        });

        // Penguin model
        loader.load("hangingBaby.glb", function (gltf) {
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.006, 0.006, 0.006);
            penguin.position.set(0, 0.05, 0.03);
            penguin.rotation.y = (-10 / 180) * Math.PI;
            scene.add(penguin);
            //penguin.lookAt(camera.position)
        });

        // add extra trees
        loader.load("HangingTree.gltf", function (gltf) {
            console.log(gltf);
            tree = gltf.scene;
            tree.position.set(5, 0.02, 0.02);
            tree.scale.set(0.02, 0.02, 0.02);
            scene.add(tree);
        });

        loader.load("HangingTree.gltf", function (gltf) {
            console.log(gltf);
            tree = gltf.scene;
            tree.position.set(-3.2, -0.02, 0.02);
            tree.scale.set(0.02, 0.02, 0.02);
            scene.add(tree);
        });

        loader.load("HangingTree.gltf", function (gltf) {
            console.log(gltf);
            tree = gltf.scene;
            tree.position.set(2.2, 0.02, 0.02);
            tree.scale.set(0.02, 0.02, 0.02);
            scene.add(tree);
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
    camera.lookAt(0, 0, 0);
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

function onResults(results) {
    // Mirror the video feed and draw the results on the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.font = "20px serif";
    canvasCtx.fillText("<", 0, canvasElement.clientHeight / 2);
    canvasCtx.fillText(">", canvasElement.clientWidth, canvasElement.clientHeight / 2);
    canvasCtx.fillText("^", canvasElement.clientWidth / 2, 30);
    canvasCtx.fillText("v", canvasElement.clientWidth / 2, 170);

    console.log(canvasElement.clientLeft);

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
    if (results.multiHandLandmarks && gameHasStarted) {
        for (let i = 0; i < results.multiHandedness.length; i++) {
            const classification = results.multiHandedness[i];
            const isRightHand = classification.label === "Right";
            const digitPosition = isRightHand ? digitPositions[0] : digitPositions[1];
            /* digitPosition.innerText = `
                    Thumb: [${results.multiHandLandmarks[i][4].x.toFixed(2)}, ${results.multiHandLandmarks[i][4].y.toFixed(2)}]
                    Index: [${results.multiHandLandmarks[i][8].x.toFixed(2)}, ${results.multiHandLandmarks[i][8].y.toFixed(2)}]
                    Middle: [${results.multiHandLandmarks[i][12].x.toFixed(2)}, ${results.multiHandLandmarks[i][12].y.toFixed(2)}]
                    Ring: [${results.multiHandLandmarks[i][16].x.toFixed(2)}, ${results.multiHandLandmarks[i][16].y.toFixed(2)}]
                    Pinky: [${results.multiHandLandmarks[i][20].x.toFixed(2)}, ${results.multiHandLandmarks[i][20].y.toFixed(2)}]
                `; */

            // use left hand to  zoom in and out
            if (isRightHand && !foundPenguin) {
                if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
                    if (camera.zoom > 0.2) camera.zoom *= 0.5;

                    camera.updateProjectionMatrix();
                    render();
                } else {
                    // pinch action
                    if (camera.zoom < 34) camera.zoom *= 2;

                    // move up down left right
                    if (results.multiHandLandmarks[i][4].x <= 0.2) {
                        console.log("move left");
                        camera.position.x += 0.1;
                        camera.updateProjectionMatrix();
                        render();
                    } else if (results.multiHandLandmarks[i][4].x >= 0.8) {
                        console.log("move right");
                        camera.position.x -= 0.1;
                        camera.updateProjectionMatrix();
                        render();
                    }

                    if (results.multiHandLandmarks[i][4].y >= 0.8) {
                        console.log("move down");
                        camera.position.y += 0.1;
                        camera.updateProjectionMatrix();
                        render();
                    } else if (results.multiHandLandmarks[i][4].y <= 0.2) {
                        console.log("move up");
                        camera.position.y -= 0.1;
                        camera.updateProjectionMatrix();
                        render();
                    }

                    camera.updateProjectionMatrix();
                    render();

                    // check if penguin is in camera view
                    camera.updateMatrixWorld();
                    const frustum = new THREE.Frustum();
                    const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                    frustum.setFromProjectionMatrix(matrix);

                    // Your 3d point to check
                    if (frustum.containsPoint(penguin.position)) {
                        // Do something with the position...
                        console.log("found penguin");
                        //foundPenguin = true;

                        setTimeout(function () {
                            success.style.display = "block";
                            //your code to be executed after 1 second
                        }, 2500);
                    } else {
                        //foundPenguin = false;
                        console.log("out of view");
                    }
                }
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
