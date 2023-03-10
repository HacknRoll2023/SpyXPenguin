import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

var startButton = document.getElementById("start");
var win = false;

start.addEventListener("click", () => {
    startGame();
    document.getElementById("help_info").style.display = "none";
    document.getElementById("help_btn").style.display = "none";
});


// Loaders
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader().setPath("../models/");

// Scene
let camera, scene, renderer;

// Models
var penguin, island, fish, fish2;

var fishes = [];
var penguinHasFish = false;
var handLabel;

class Fish {
    constructor() {
        var direction = Math.round(Math.random()) ? 'left' : 'right';
        var speed = Math.random()/100;
        this.displacement = direction=='left' ? speed : -speed;
        this.yrotation = direction=='left' ? Math.PI : 0;
        this.xcoord = direction=='left' ? -3 : 3 ;
        this.ycoord = Math.random() * (0.5 - -1) - 1;
    }
    set3DFish(fish) {
        this.fish = fish;
    }
}

// Game state variables
var gameState = "idle";             // idle, play, end
const clock = new THREE.Clock();
const maxtime = 60;
const numTargetFish = 5;
var numFishCaught = 0;

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
    camera.position.set(0, 0, 4);
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
        const glbPathIsland = "FishingScene.gltf";
        loader.load(glbPathIsland, function (gltf) {
            island = gltf.scene;
            island.scale.set(0.3, 0.3, 0.3);
            island.position.set(0.2, -1.5, 0.6);
            island.rotation.set(0.3, (-90 / 180) * Math.PI, 0);
            scene.add(island);
        });

        // Penguin model
        const glbPath = "Penguin.gltf";
        loader.load(glbPath, function (gltf) {
            console.log(gltf);
            penguin = gltf.scene;
            penguin.scale.set(0.1, 0.1, 0.1);
            penguin.position.set(3, 1.5, 0);
            penguin.rotation.set(0, (-90 / 180) * Math.PI, 0);
            scene.add(penguin);
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

    // // controls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener("change", render); // use if there is no animation loop
    // controls.minDistance = 0.2;
    // controls.maxDistance = 10;
    // controls.target.set(0, 0.25, 0);
    // controls.update();

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
export function startGame() {
    gameState = "play";
    clock.start();
    generateFish();
}

export function updateScene(x, y, label) {
    updatePenguin(x, y, label);
    if (gameState == "play") {
        updateFish();
        checkHand();
    }
    updateText();
    render();
}

function checkHand() {
    // console.log(penguin.position.x + " " + penguin.position.y);
    if (handLabel == "open" && penguin.position.x > 0.8 && penguin.position.y > 0.4 && penguinHasFish) {
        // Penguin is in drop off zone and can drop off fish
        console.log("Fish released!");
        showFishDropOff();
        penguinHasFish = false;
        numFishCaught += 1;
        if (numFishCaught >= 5) win = true;

        if (win) {
            setTimeout(() => location.href = '../sealNoReturnSon/sealNoReturnSon.html', 2000);
        }

        console.log(numFishCaught);
    }
    if (handLabel == "closed" && !penguinHasFish) {
        // Penguin is in close proximity to fish and can catch it
        var fishIdx = fishIsNear()
        // console.log(fishIdx);
        if (fishIdx > -1) {
            console.log("Fish caught!");
            penguinHasFish = true;
            fishes.splice(fishIdx, 1);
        }
    }
}

function fishIsNear() {
    var penguinBB = new THREE.Box3().setFromObject(penguin);
    var penguinBB2 = new THREE.Box2(new THREE.Vector2(penguinBB.min.x,penguinBB.min.y), new THREE.Vector2(penguinBB.max.x,penguinBB.max.y));
    // console.log(penguinBB2);

    var res = -1;
    fishes.forEach((fishObj, index) => {
        // Check if any of the other BBs intersects with this bb
        var fishBB = new THREE.Box3().setFromObject(fishObj.fish);
        var fishBB2 = new THREE.Box2(new THREE.Vector2(fishBB.min.x,fishBB.min.y), new THREE.Vector2(fishBB.max.x,fishBB.max.y));
        // console.log(fishObj.box);
        // console.log(index);
        // updateTime.innerHTML = fishObj.xcoord + " " + fishObj.ycoord + "</br> " + penguin.position.x + " " + penguin.position.y;

        if (penguinBB2.intersectsBox(fishBB2)) {
            console.log("collision!")
            scene.remove(fishObj.fish);
            // fishes.splice(index, 1);
            res = index;
        }
    });
    return res;
}

function updatePenguin(x,y,label) {
    if (penguin) {
        penguin.position.set(x, y, 0);
        handLabel = label;
    }
}

function generateFish() {
    if (gameState == "play") {
        // Fish model
        const glbPath2 = "Fish.gltf";
        loader.load(glbPath2, function (gltf) {
            fish = gltf.scene;

            // generate new Fish object
            let fishObj = new Fish();
            fish.scale.set(0.03, 0.03, 0.03);
            // fish.position.set(0,0, 1);
            fish.position.set(fishObj.xcoord, fishObj.ycoord, 1);
            fish.rotation.set(0, fishObj.yrotation, 0);

            fishes.push(fishObj);
            fishObj.set3DFish(fish);

            scene.add(fish);
        })
    }
    setTimeout(generateFish, 3000); // Generate new fish every 3s
}

function updateFish() {
    if (fishes.length > 0) {
        fishes.forEach(fishObj => {
            if (Math.abs(fish.position.x) <=3) {
                fishObj.xcoord += fishObj.displacement;
                fishObj.fish.position.x = fishObj.xcoord;
            }
        });
    }
}

function updateText() {
    if (gameState=="play") {
        var timeleft = maxtime-Math.round(clock.getElapsedTime());
        updateTime.innerText = timeleft + " seconds left!";
        updateFishCount.innerText = numFishCaught + " / " + numTargetFish;
    }
    if (timeleft <= 0 || numFishCaught == numTargetFish) {
        clock.stop();
        gameState = "end";
        if (timeleft <= 0) updateTime.innerText = "Time's up!";
        if (numFishCaught == numTargetFish) updateTime.innerText = "Challenge complete! Well done!";
    }
    updateFish();   // to clean up area?
}

function showFishDropOff() {
    // Fish model
    const glbPath2 = "Fish.gltf";
    loader.load(glbPath2, function (gltf) {
        fish2 = gltf.scene;
        fish2.scale.set(0.03, 0.03, 0.03);
        fish2.position.set(2.35, 1.45, -0.5);
        scene.add(fish2);
        
        animateFishDropOff();
    })
}

function animateFishDropOff() {
    if (fish2.position.y > 1.2) {
        console.log(fish2.position.y);
        fish2.position.y -= 0.05;
        render();
        setTimeout(animateFishDropOff, 100);
    } else {
        scene.remove(fish2);
    }
}