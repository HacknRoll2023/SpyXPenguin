import { updateScene } from './FishingScene.js';
///// HANDTRACK VARIABLES ////////

// get the video and canvas and set the context for the canvas
const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;
let filteredPreds = []; // init predictions to use elsewhere in the code

var contextLineWidth = "3"
var contextStrokeStyle = "black"

///// GAME VARIABLES ///////
var framesPerSecond = 24;
var frame = 1;

// midpoint on the pred as marked by the dot relative to the canvas
var handPos = {
    x: 0,
    y: 0
};

// scaled values for the hand
var handXScaled = 0;
var handYScaled = 0;

var newHand = false; // if a new hand detection is observed

// post of character on canvas
var penguinPos = {
    x: 0,
    y: 0
}
var handLabel;

var dropoffCoords = {
    topleftx: 300,
    toplefty: 0,
    btmrightx: 500,
    btmrighty: 150
}

//////////////////// HANDTRACK CODES /////////////////////////
// code from https://codepen.io/victordibia/pen/RdWbEY

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

// Function based off the handtrack helper methods in their library
function startVideo() {

    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            // optional update of text on screen to indicate the tracking has started successfully
            // updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            // runDetection defined in this script below
            runDetection()
        } else {
            // optional update of text on screen to indicate video is not enabled
            // updateNote.innerText = "Please enable video"
        }
    });
}

// Function to toggle the starting and stopping of the video using library helper methods
function toggleVideo() {

    if (!isVideo) {
        // updateNote.innerText = "Starting video"
        startVideo();

    } else {
        // updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        // updateNote.innerText = "Video stopped"
    }
}

// Function to return the predictions as used above
function runDetection() {
    model.detect(video).then(predictions => {   
        //removing face and pinch labels
        filteredPreds = predictions.filter(innerArray => innerArray.label !== 'face' && innerArray.label !== 'pinch' ); 

        model.renderPredictions(filteredPreds, canvas, context, video);

        // add movement area onto the camera feed
        context.beginPath();
        context.lineWidth = contextLineWidth
        context.strokeStyle = contextStrokeStyle
        context.strokeRect(dropoffCoords.topleftx, dropoffCoords.toplefty, dropoffCoords.btmrightx, dropoffCoords.btmrighty);

        context.beginPath();
        context.fillStyle = "red"
        // context.fillRect(penguinPos.x / 2 + 100, penguinPos.y / 2 + 80, 10, 10);

        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model (note this function runs outside the functions (i think it only runs once?))
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image
    model = lmodel
    // updateNote.innerText = "Loaded Model!"
    // trackButton.disabled = false
    toggleVideo(); 
});

//////////////////// GAME LOGIC CODES /////////////////////////
window.onload = function() {
    setInterval(function() {
        checkHand();
        moveEverything();
        drawEverything();

        // increment frame
        if (frame === 24) {
            frame = 1;
        } else {
            frame++;
        }
    }, 1000/framesPerSecond);
}

// check if there is a new hand position and update
function checkHand() {
    // if theres just one hand
    if (filteredPreds.length === 1) {

        // calculate the center
        // bbox is x, y width, height
        handPos.x = filteredPreds[0].bbox[0] + filteredPreds[0].bbox[2] / 2
        handPos.y = filteredPreds[0].bbox[1] + filteredPreds[0].bbox[3] / 2

        handLabel = filteredPreds[0].label; // closed, open, point

        // update that newHand detected is true
        newHand = true;
    }

}  

function moveEverything() {
    // console.log("HAND >>> " + handPos.x + " --- " + handPos.y);
    // if hand is within fish dropoff box
    if (handPos.x > dropoffCoords.topleftx && handPos.x < dropoffCoords.btmrightx &&
        handPos.y > dropoffCoords.toplefty && handPos.y < dropoffCoords.btmrighty) {
            contextStrokeStyle = "lime"
        } else {
            contextStrokeStyle = "black"
        }

    if (handPos.x > 50 && handPos.x < 450) {
            handXScaled = Math.round((handPos.x - 250) /65 * 100)/100
            penguinPos.x = handXScaled
        }

    if (handPos.y > 105 && handPos.y < 300) {
            handYScaled = Math.round(-(handPos.y - 180) /80 * 100)/100
            penguinPos.y = handYScaled
        }
    // console.log(handXScaled + " --- " + handYScaled);

}

function drawEverything() {
    updateScene(penguinPos.x, penguinPos.y, handLabel);
}