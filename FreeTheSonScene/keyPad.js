import * as THREE from "three";

//for game
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

// initialise variables for handtracking
// const videoElement = document.getElementsByClassName("input_video")[0];
// const canvasElement = document.getElementsByClassName("output_canvas")[0];
// const canvasCtx = canvasElement.getContext("2d");

// // hide the video element, and just show the canvas
// videoElement.style.display = "none";

// const digitPositions = document.getElementsByClassName("digit-position__value");


// function render() {
//     renderer.render(scene, camera);
// }

// render();
// function onResults(results) {
//     // Mirror the video feed and draw the results on the canvas
//     canvasCtx.save();
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//     canvasCtx.translate(canvasElement.width, 0);
//     canvasCtx.scale(-1, 1);
//     canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
//     if (results.multiHandLandmarks) {
//         for (const landmarks of results.multiHandLandmarks) {
//             drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
//                 color: "#00FF00",
//                 lineWidth: 5,
//             });
//             drawLandmarks(canvasCtx, landmarks, {
//                 color: "#FF0000",
//                 lineWidth: 2,
//             });
//         }
//     }

//     canvasCtx.restore();

//     // wrist - 0
//     // thumb tip - 4
//     // index tip - 8
//     // middle tip - 12
//     // ring tip - 16
//     // pinky tip - 20

//     //   display the coordinates of the tips of the fingers for each hand
//     if (results.multiHandLandmarks) {
//         for (let i = 0; i < results.multiHandedness.length; i++) {
//             const classification = results.multiHandedness[i];
//             const isRightHand = classification.label === "Right";
//             const digitPosition = isRightHand ? digitPositions[0] : digitPositions[1];
//             digitPosition.innerText = `
//                     Thumb: [${results.multiHandLandmarks[i][4].x.toFixed(2)}, ${results.multiHandLandmarks[
//                 i
//             ][4].y.toFixed(2)}]
//                     Index: [${results.multiHandLandmarks[i][8].x.toFixed(2)}, ${results.multiHandLandmarks[
//                 i
//             ][8].y.toFixed(2)}]
//                     Middle: [${results.multiHandLandmarks[i][12].x.toFixed(2)}, ${results.multiHandLandmarks[
//                 i
//             ][12].y.toFixed(2)}]
//                     Ring: [${results.multiHandLandmarks[i][16].x.toFixed(2)}, ${results.multiHandLandmarks[
//                 i
//             ][16].y.toFixed(2)}]
//                     Pinky: [${results.multiHandLandmarks[i][20].x.toFixed(2)}, ${results.multiHandLandmarks[
//                 i
//             ][20].y.toFixed(2)}]
//                 `;

//             //   check if index finger is higher than middle finger
//             if (results.multiHandLandmarks[i][8].y < results.multiHandLandmarks[i][12].y) {
//                 console.log("index is higher than middle");
//                 spinPenguin(3);
//             } else {
//                 console.log("index is lower than middle");
//                 if (animationId !== null) cancelAnimationFrame(animationId);
//             }

//             // zoom in and out
//             if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
//                 console.log("zoom out");
//                 camera.zoom = 0.5;
//                 camera.updateProjectionMatrix();
//             } else { // pinch action
//                 console.log("zoom in");
//                 camera.zoom = 2;
//                 camera.updateProjectionMatrix();
//             }
//         }
//     }
// }

// const hands = new Hands({
//     locateFile: (file) => {
//         return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
//     },
// });
// hands.setOptions({
//     maxNumHands: 2,
//     modelComplexity: 1,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence: 0.5,
// });
// hands.onResults(onResults);

// const webcam = new Camera(videoElement, {
//     onFrame: async () => {
//         await hands.send({ image: videoElement });
//     },
//     width: 1280,
//     height: 720,
// });
// webcam.start();


//game logic
export default class Pad {
    constructor(letter, xOffset, yOffset) {

        this.animate = false;
        this.letter = letter;
        this.xOffset = xOffset;
        this.yOffset = yOffset;

        this.padGroup = new THREE.Group();
        this.padGroup.position.x = xOffset;
        this.padGroup.position.y = yOffset;
        this.addPad();

        this.padGroup.add(mesh)

        const animate = (t) => {
            if (this.animate) {
                this.padGroup.rotation.z =
                    (Math.sin(date.now() * 0.01) * Math.PI) / 32;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    setFont(parseFont) {
        this.parsedFont = parseFont;
    }

    checkLetter(word, letter) {
        if (this.letter === letter) {
            //set to gray as default
            this.padGroup.customDepthMaterial.colorWrite.set('#008000');
            this.animate = true;
        } else if (word.includes(this.letter)) {
            //set to green
            this.block.material.color.set('#f7df1e');
        }
    }

    addPad() {
        const geometry = new RoundedBoxGeometry(8, 8, 8, 4, 1);
        const material = new THREE.MeshPhongMaterial({
            color: '#fafafa',
            transparent: true,
            opacity: 0.25,
        });
    }

    getPadGroup() {
        return this.padGroup
    }

    //didnt add in removeLEtter()

    addLetter(letter){
        this.letter = letter;
        const letterGeometry = new TextGeometry(letter, {
            font:this.parsedFont,
            size: 5,
            height:2,
        });

        const letterMaterial = new THREE.MeshNormalMaterial({});
        this.letterMesh = new THREE.Mesh(letterGeometry,letterMaterial);
        this.letterMesh.position.x = -2;
        this.letterMesh.position.y = -2;
        this.letterMesh.position.z = -1;
        this.padGroup.add(this.letterMesh);
        this.block.material.opacity = 0.5;

    }



}



