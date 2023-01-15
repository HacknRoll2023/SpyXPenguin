import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// initialise variables for handtracking
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
// const resetButton = document.getElementById("reset");
const instructions = document.getElementById("instructions");
const closeButton = document.getElementById("close");
const endSceneClose = document.getElementById("endSceneClose");
const success = document.getElementById("success");
const progress_bar = document.getElementById("progress_bar");
const end_scene = document.getElementById("endScene");
var rope_strength = document.getElementById("rope_strength")
var isLeft = false
var isRight = true

// resetButton.addEventListener("click", resetCamera);

endSceneClose.addEventListener("click", () => {
    location.href = "../FinalScene/FinalScene.html";  
});

closeButton.addEventListener("click", () => {
    instructions.style.display = "none";
    // resetButton.style.display = "block";
    gameHasStarted = true;
    progress_bar.style.display = "block";
});

// function resetCamera() {
//     console.log("reset");
//     camera.zoom = 0.25;
//     camera.lookAt(0,0,0);
//     camera.updateProjectionMatrix();
//     render();
// }

// hide the video element, and just show the canvas
videoElement.style.display = "none";

const digitPositions = document.getElementsByClassName("digit-position__value");

// Scene
let camera, scene, renderer, clock;

// Models
var tree, penguin, knife, b_penguin;

let threeCamera, threeControls;
var spaceCount = 0;

// Game state
var foundPenguin = false, gameHasStarted = false, gameHasEnded = false;

init();
render();

function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(0, 1, 2);

    scene = new THREE.Scene();
    clock = new THREE.Clock();

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

        // Tree model
        loader.load("HangingTree.gltf", function (gltf) {
            // console.log(gltf);
            tree = gltf.scene;
            tree.position.set(0.4, 0, 0);
            tree.rotateY((30 / 180) * Math.PI)
            tree.scale.set(0.25, 0.25, 0.25);
            scene.add(tree);
        });

        // Penguin model
        loader.load("hangingBaby.glb", function (gltf) {
            // console.log(gltf);
            penguin = gltf.scene;
            penguin.position.set(0, 0.8, 0);
            penguin.scale.set(0.06, 0.06, 0.06);
            penguin.rotateY((270 / 180) * Math.PI)
            // penguin.rotation.y = (-10 / 180) * Math.PI;
            scene.add(penguin);
            //penguin.lookAt(camera.position)
        });

        loader.load("Knife.gltf", function (gltf) {
            // console.log(gltf);
            knife = gltf.scene;
            knife.position.set(0, 0, 0);
            knife.rotateY((-90 / 180) * Math.PI)
            knife.rotateZ((70 / 180) * Math.PI)

            knife.scale.set(0.06, 0.06, 0.06);
            scene.add(knife);
        });

        loader.load("BabyPenguin.gltf", function (gltf) {
            // console.log(gltf);
            b_penguin = gltf.scene;
            b_penguin.position.set(0, 0.4, 0);
            b_penguin.scale.set(0.06, 0.06, 0.06);
            b_penguin.rotateY((270 / 180) * Math.PI)
            // penguin.rotation.y = (-10 / 180) * Math.PI;
            scene.add(b_penguin);
            b_penguin.visible = false;
            //penguin.lookAt(camera.position)
        });

        // // add extra trees
        // loader.load("HangingTree.gltf", function (gltf) {
        //     console.log(gltf);
        //     tree = gltf.scene;
        //     tree.position.set(5, 0.02, 0.02);
        //     tree.scale.set(0.02, 0.02, 0.02);
        //     scene.add(tree);
        // });

        // loader.load("HangingTree.gltf", function (gltf) {
        //     console.log(gltf);
        //     tree = gltf.scene;
        //     tree.position.set(6,6,6);
        //     tree.scale.set(0.02, 0.02, 0.02);
        //     scene.add(tree);
        // });

        // loader.load("HangingTree.gltf", function (gltf) {
        //     console.log(gltf);
        //     tree = gltf.scene;
        //     tree.position.set(2.2, 0.02, 0.02);
        //     tree.scale.set(0.02, 0.02, 0.02);
        //     scene.add(tree);
        // });
        // const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green
        // const cube1 = new THREE.Mesh(geometry, material);
        // cube1.position.set(0, 0.2, 0);
        // scene.add(cube1);

        // const geometry2 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red
        // const cube2 = new THREE.Mesh(geometry2, material2);
        // cube2.position.set(0.2, 0, 0);
        // scene.add(cube2);

        // const geometry3 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // blue
        // const cube3 = new THREE.Mesh(geometry3, material3);
        // cube3.position.set(0, 0, 0.2);
        // scene.add(cube3);

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
    // render();

    // // Orbit controls
    threeControls = new OrbitControls(camera, renderer.domElement);
    threeControls.addEventListener("change", render); // use if there is no animation loop
    threeControls.minDistance = 1;
    threeControls.maxDistance = 5;
    threeControls.target.set(0, 0.25, 0);
    threeControls.update();

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

    canvasCtx.font = "20px serif";
    canvasCtx.fillText("<", 0, canvasElement.clientHeight / 2);
    canvasCtx.fillText(">", canvasElement.clientWidth, canvasElement.clientHeight / 2);
    canvasCtx.fillText("^", canvasElement.clientWidth / 2, 30);
    canvasCtx.fillText("v", canvasElement.clientWidth / 2, 170);

    // console.log(canvasElement.clientLeftq)
    if (rope_strength.value <= 0) {
        penguin.visible = false
        b_penguin.visible = true
        while (b_penguin.position.y > 0) {
                b_penguin.position.y -= 0.000015
                //your code to be executed after 1 second
            // console.log(b_penguin.position.y)

        }
        setTimeout(function () {
            console.log("end")
            gameHasEnded = true;
            gameHasStarted = false;
            end_scene.style.display = "block";
            progress_bar.style.display = "none";
            //your code to be executed after 1 second
        }, 3000);


    }
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
    //middle finger mcp - 9

    //   display the coordinates of the tips of the fingers for each hand
    if (results.multiHandLandmarks && gameHasStarted) {
        render()

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

            // use left hand to  zoom in and outs
            if (isRightHand) {
                knife.position.x = 0.5 - results.multiHandLandmarks[i][9].x;
                knife.position.y = 1 - results.multiHandLandmarks[i][9].y;
                knife.position.z = results.multiHandLandmarks[i][9].z;
            }
            let flag = 0
            // console.log(knife.position.x)
            // console.log(knife.position.y)
            if (knife.position.x < -0.05) {
                isLeft = true
            } else if (knife.position.x > 0.05) {
                isRight = true
                flag = 1
            }

            if (isLeft == isRight && knife.position.y > 0.3 && knife.position.y < 0.7) {
                console.log("cut")
                rope_strength.value -= 5.5
                if (flag) {
                    isLeft = false
                } else {
                    isRight = false
                }

            }
            // if(knife.position.x > -0.06 && knife.position.x<0.55 && knife.position.y>0.3 && knife.position.y<0.7 ){
            //     rope_strength.value -= 0.5
            //     console.log(knife.position.x, rope_strength.value)
            // }

            // if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
            //     // if (camera.zoom > 0.2) camera.zoom *= 0.5;

            //     // camera.updateProjectionMatrix();
            //     // render();
            // } else {
            //     // pinch action
            //     // if (camera.zoom < 10) camera.zoom *= 2;

            //     // move up down left right
            //     if (results.multiHandLandmarks[i][4].x <= 0.2) {
            //         console.log("move left");
            //         // camera.position.x += 0.1;
            //         // camera.updateProjectionMatrix();
            //         // render();
            //     } else if (results.multiHandLandmarks[i][4].x >= 0.8) {
            //         console.log("move right");
            //         // camera.position.x -= 0.1;
            //         // camera.updateProjectionMatrix();
            //         // render();
            //     }

            //     if (results.multiHandLandmarks[i][4].y >= 0.8) {
            //         console.log("move down");
            //         // camera.position.y += 0.1;
            //         // camera.updateProjectionMatrix();
            //         // render();
            //     } else if (results.multiHandLandmarks[i][4].y <= 0.2) {
            //         console.log("move up");
            //         // camera.position.y -= 0.1;
            //         // camera.updateProjectionMatrix();
            //         // render();
            //     }

            // camera.updateProjectionMatrix();
            // render();

            // check if penguin is in camera view
            // camera.updateMatrixWorld();
            // const frustum = new THREE.Frustum();
            // const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            // frustum.setFromProjectionMatrix(matrix);

            // // Your 3d point to check
            // if (frustum.containsPoint(penguin.position)) {
            //     // Do something with the position...
            //     console.log("found penguin");

            //     setTimeout(function() {
            //         success.style.display = "block";
            //         //your code to be executed after 1 second
            //       }, 2500);
            // } else {
            //     console.log("out of view")
            // }


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
