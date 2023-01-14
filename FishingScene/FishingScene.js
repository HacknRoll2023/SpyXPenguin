import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Loaders
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader().setPath("../models/");

// Scene
let camera, scene, renderer;

// Models
var penguin, island;
var fish;
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

// Game state
var gameState = "idle";             // idle, play, end
const clock = new THREE.Clock();
const maxtime = 60;
const targetFish = 10;
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

        const axes = new THREE.AxesHelper(5);
        scene.add(axes);

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
    checkHand();
}

export function updateScene(x, y, label) {
    updatePenguin(x, y, label);
    if (gameState == "play") {
        updateFish();
        // checkHand();
    }
    updateTimer();
    render();
}

function checkHand() {
    updateTime.innerText = penguinHasFish;

    // console.log(penguin.position.x + " " + penguin.position.y);
    if (handLabel == "open" && penguin.position.x > 0.8 && penguin.position.y > 0.4 && penguinHasFish) {
        // Penguin is in drop off zone and can drop off fish
        console.log("Fish released!");
        penguinHasFish = false;
        // increase fish caught count
    }
    if (handLabel == "closed" && !penguinHasFish) {
        // Penguin is in close proximity to fish and can catch it
        var index = -1;
        index = fishIsNear();
        console.log(index);
        if (index > -1) {
            console.log("Fish caught!");
            penguinHasFish = true;
            console.log(penguinHasFish);
            fishes.splice(index, 1);
        }
    }
    setTimeout(checkHand, 250);
}

function fishIsNear() {
    var penguinBB = new THREE.Box3().setFromObject(penguin);
    var penguinBB2 = new THREE.Box2(new THREE.Vector2(penguinBB.min.x,penguinBB.min.y), new THREE.Vector2(penguinBB.max.x,penguinBB.max.y));
    // console.log(penguinBB2);

    fishes.forEach((fishObj, index) => {
        // Check if any of the other BBs intersects with this bb
        var fishBB = new THREE.Box3().setFromObject(fishObj.fish);
        fishBB = new THREE.Box2(new THREE.Vector2(fishBB.min.x,fishBB.min.y), new THREE.Vector2(fishBB.max.x,fishBB.max.y));
        // console.log(fishObj.box);
        // console.log(index);
        // updateTime.innerHTML = fishObj.xcoord + " " + fishObj.ycoord + "</br> " + penguin.position.x + " " + penguin.position.y;

        if (penguinBB2.intersectsBox(fishBB)) {
            console.log("collision!")
            console.log(index)
            scene.remove(fishObj.fish);
            return index;
        }
    });
}

function updatePenguin(x,y,label) {
    penguin.position.set(x, y, 0);
    handLabel = label;
}

function generateFish() {
    if (gameState == "play") {
        // Fish model
        // console.log(gameState + " Making fish...")
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
    setTimeout(generateFish, 4000); // Generate new fish every second
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

function updateTimer() {
    if (gameState=="play") {
        var timeleft = maxtime-Math.round(clock.getElapsedTime());
        // updateTime.innerText = timeleft + " seconds left!";
    }
    if (timeleft <= 0) {
        clock.stop();
        gameState = "end";
        updateTime.innerText = "Time's up!";
    }
    updateFish();   // to clean up area?
}
