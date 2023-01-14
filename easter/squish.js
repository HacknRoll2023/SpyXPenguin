// Three.js ------------------------------------------------------------
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

let threeCamera, scene, renderer;
var sceneLoaded = false;

var penguin;

function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);

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
    new RGBELoader().setPath("../textures/equirectangular/").load("kloppenheim_06_puresky_2k.hdr", function (texture) {
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
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.1, 0.1, 0.1);
            penguin.position.set(0, 0, 0);
            //penguin.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            scene.add(penguin);
            penguin.rotation.y = Math.PI;

            setTimeout(() => {
                render();
            }, 1000);
        });

        var groundTexture = new THREE.TextureLoader().load("../textures/textureImages/snowTexture3.jpg");
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

const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// hide the video element, and just show the canvas
videoElement.style.display = "none";

const digitPositions = document.getElementsByClassName("digit-position__value");

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
            /* digitPosition.innerText = `
                    Thumb: [${results.multiHandLandmarks[i][4].x.toFixed(2)}, ${results.multiHandLandmarks[i][4].y.toFixed(2)}]
                    Index: [${results.multiHandLandmarks[i][8].x.toFixed(2)}, ${results.multiHandLandmarks[i][8].y.toFixed(2)}]
                    Middle: [${results.multiHandLandmarks[i][12].x.toFixed(2)}, ${results.multiHandLandmarks[i][12].y.toFixed(2)}]
                    Ring: [${results.multiHandLandmarks[i][16].x.toFixed(2)}, ${results.multiHandLandmarks[i][16].y.toFixed(2)}]
                    Pinky: [${results.multiHandLandmarks[i][20].x.toFixed(2)}, ${results.multiHandLandmarks[i][20].y.toFixed(2)}]
                `; */

            // use left hand to  zoom in and out
            if (isRightHand) {
                if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
                    penguin.scale.set(0.1,0.1,0.1)
                    render();
                } else {
                    // pinch action
                    penguin.scale.set(0.09, 0.11, 0.09);
                    render();
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
