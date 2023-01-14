import * as THREE from 'three';

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

import Pad from './keyPad';


export default class Wordle {
    constructor() {
      this.level = 0;
      this.letterIndex = 0;
      this.currentWord = '';
      this.word = 'debug';
  
      this.wordleGroup = new THREE.Group();
      this.wordleGroup.position.x = -20;
      this.wordleGroup.position.y = -20;
      this.createBoard();
      this.setUpFont();
    }
    createBoard() {
        this.blocks = [
          new Pad('', 0, 40),
          new Pad('', 10, 40),
          new Pad('', 20, 40),
          new Pad('', 30, 40),
          new Pad('', 40, 40),
    
          new Pad('', 0, 30),
          new Pad('', 10, 30),
          new Pad('', 20, 30),
          new Pad('', 30, 30),
          new Pad('', 40, 30),
    
          new Pad('', 0, 20),
          new Pad('', 10, 20),
          new Pad('', 20, 20),
          new Pad('', 30, 20),
          new Pad('', 40, 20),
    
          new Pad('', 0, 10),
          new Pad('', 10, 10),
          new Pad('', 20, 10),
          new Pad('', 30, 10),
          new Pad('', 40, 10),
    
          new Pad('', 0, 0),
          new Pad('', 10, 0),
          new Pad('', 20, 0),
          new Pad('', 30, 0),
          new Pad('', 40, 0),
        ];
    
        this.pad.forEach((pad) => this.wordleGroup.add(pad.padGroup));
      }
    
    }
