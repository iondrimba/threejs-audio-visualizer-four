import '../scss/index.scss';
import Loader from './loader';
import * as TweenMax from './TweenMax.min';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class App {
  constructor() {
    this.songFile = 'https://iondrimbafilho.me/autotron.mp3';
    this.percent = 0;
    this.playing = false;
    this.volume = 1;
    this.sceneBackGroundColor = 0xfff700;
    this.objectsColor = 0xae12d4;
    this.rowTiles = [];
    this.groupTiles = new THREE.Object3D();

    this.loader = new Loader();
    this.loader.progress((percent) => { this.progress(percent); });
    this.loaderBar = document.querySelector('.loader');
    this.loader.load(this.songFile);
    this.playIntro = document.querySelector('.play-intro');
    this.loader.complete = this.complete.bind(this);

  }

  progress(percent) {
    this.loaderBar.style.transform = `scale(${(percent / 100) + .1}, 1.1)`;
    if (percent === 100) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.playIntro.classList.add('control-show');
          this.loaderBar.classList.add('removeLoader');
          this.loaderBar.style.transform = 'scale(1, 0)';
        })
      }, 300);
    }
  }

  complete(file) {
    setTimeout(() => {
      this.firstRing = new THREE.Object3D();

      this.setupAudio();
      this.addSoundControls();
      this.createScene();
      this.createCamera();
      this.addAmbientLight();
      this.addSpotLight();
      this.addCameraControls();
      this.addFloor();
      this.animate();
      this.playSound(file);
      this.addEventListener();

      setInterval(() => {
        if (this.playing) {
          this.addTilesRow(this.rowTiles);
          this.removeOldTiles(this.rowTiles);
        }
      }, 600);
    });
  }

  removeOldTiles(tiles) {
    if (tiles.length % 25 === 0) {
      const removedTiles = tiles[0];
      let index = 0;
      for (const tile in removedTiles) {
        if (removedTiles.hasOwnProperty(tile)) {
          const element = removedTiles[tile];

          TweenMax.delayedCall(0.07 * index, () => {
            TweenMax.to(element.scale, .5, {
              z: 0.01,
              ease: Power2.easeOut,
              onComplete: (element) => {
                this.groupTiles.remove(element);
              },
              onCompleteParams: [element]
            });
          });
          index++;
        }
      }

      tiles = tiles.splice(0, 1);
    }
  }

  addTilesRow(tiles) {
    const rows = 8;
    const cols = 1;
    const gutter = 1.05;
    let positions = [];
    let index = 0;
    let prevPos = 0;

    const hasPrev = tiles.length && tiles[tiles.length - 1][0].position;

    if (tiles.length) {
      prevPos = tiles[tiles.length - 1][0].position.x + gutter;
    }

    const size = .5;
    const geometry = new THREE.BoxBufferGeometry(size, size, 5);
    const material = new THREE.MeshLambertMaterial({
      color: this.objectsColor,
      emissive: 0x0
    });

    for (let col = 0; col < cols; col++) {
      positions[col] = [];
      tiles.push([]);

      for (let row = 0; row < rows; row++) {
        const pos = {
          z: row,
          y: 3,
          x: hasPrev ? prevPos : col
        }

        positions[col][row] = pos;
        const plane = this.createObj(geometry, material);

        plane.scale.set(1, 1, 0.01);

        if (col > 0) {
          pos.x = (positions[col - 1][row].x * plane.size) + gutter;
        }

        if (row > 0) {
          pos.z = (positions[col][row - 1].z * plane.size) + gutter;
        }

        plane.position.set(pos.x, pos.y, pos.z);

        plane.rotateX(this.radians(90));

        this.groupTiles.add(plane);

        TweenMax.delayedCall(0.1 * index, () => {
          TweenMax.to(plane.children[0].material, .3, {
            opacity: 1,
            ease: Power2.easeOut
          });
        });

        tiles[tiles.length - 1].push(plane);

        index++;
      }

      index++;
    }

    positions = null;
  }

  playSound(file) {
    setTimeout(() => {
      this.audioElement.src = file;
      this.audioElement.load();
    }, 1000);
  }

  drawWave() {
    if (this.playing) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      let index = 0;

      for (let i = 0; i < this.rowTiles.length; i++) {
        for (let j = 0; j < this.rowTiles[i].length; j++) {
          const freq = this.frequencyData[index];
          const scale = freq / 50 <= 0 ? 0.01 : freq / 50;

          TweenMax.to(this.rowTiles[i][j].scale, .2, {
            z: scale - 3 < 0 ? 0.01 : scale - 3
          });
          index++;
        }
        index++;
      }
    }
  }

  addSoundControls() {
    this.btnPlay = document.querySelector('.play');
    this.btnPause = document.querySelector('.pause');

    this.btnPlay.addEventListener('click', () => {
      this.play();
    });

    this.btnPause.addEventListener('click', () => {
      this.pause();
    });
  }

  pause() {
    this.audioElement.pause();
    this.btnPause.classList.remove('control-show');
    this.btnPlay.classList.add('control-show');
  }

  play() {
    this.audioCtx.resume();
    this.audioElement.play();
    this.btnPlay.classList.remove('control-show');
    this.btnPause.classList.add('control-show');
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneBackGroundColor);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.groupTiles.position.set(10, 0, -5);
    this.scene.add(this.groupTiles);

    document.body.appendChild(this.renderer.domElement);
  }

  addEventListener() {
    this.playIntro.addEventListener('click', (evt) => {
      evt.currentTarget.classList.remove('control-show');
      this.play();
    });

    document.body.addEventListener('mouseup', () => {
      requestAnimationFrame(() => {
        document.body.style.cursor = '-moz-grab';
        document.body.style.cursor = '-webkit-grab';
      });
    });

    document.body.addEventListener('mousedown', () => {
      requestAnimationFrame(() => {
        document.body.style.cursor = '-moz-grabbing';
        document.body.style.cursor = '-webkit-grabbing';
      });
    });

    document.body.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 32 || evt.code === 'Space') {
        this.playIntro.classList.remove('control-show');
        this.playing ? this.pause() : this.play();
      }
    });
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(50, 50, -50);
    this.scene.add(this.camera);
  }

  addCameraControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  createObj(geometry, material) {
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    obj.receiveShadow = true;
    obj.position.z = -2.5;
    obj.size = 1;
    obj.material.opacity = 0;
    obj.material.transparent = true;

    const pivot = new THREE.Object3D();
    pivot.add(obj);
    pivot.size = 1;

    return pivot;
  }

  onResize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    this.camera.aspect = ww / wh;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(ww, wh);
  }

  addFloor() {
    const planeGeometry = new THREE.PlaneBufferGeometry(250, 250);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: .05 });

    this.floor = new THREE.Mesh(planeGeometry, planeMaterial);

    planeGeometry.rotateX(- Math.PI / 2);

    this.floor.position.y = 0;
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  addSpotLight() {
    this.spotLight = new THREE.SpotLight(0xffffff);
    this.spotLight.position.set(-10, 60, -10);
    this.spotLight.castShadow = true;
    this.spotLight.angle = Math.PI / 4;
    this.spotLight.penumbra = 0;
    this.spotLight.decay = .5;
    this.spotLight.distance = 100;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 10;
    this.spotLight.shadow.camera.far = 100;

    this.scene.add(this.spotLight);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);
  }

  animate() {
    this.controls.update();

    if (this.rowTiles[this.rowTiles.length - 1]) {
      const x = -this.rowTiles[this.rowTiles.length - 1][0].position.x + 15;
      TweenMax.to(this.groupTiles.position, 1, {
        x: x,
        ease: Power2.easeOut
      });
    }

    this.renderer.render(this.scene, this.camera);

    this.drawWave();

    requestAnimationFrame(this.animate.bind(this));
  }

  radians(degrees) {
    return degrees * Math.PI / 180;
  }

  setupAudio() {
    this.audioElement = document.getElementById('audio');
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;

    this.source = this.audioCtx.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    this.source.connect(this.audioCtx.destination);

    this.bufferLength = this.analyser.frequencyBinCount;

    this.frequencyData = new Uint8Array(this.bufferLength);
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('playing', () => {
      this.playing = true;
    });
    this.audioElement.addEventListener('pause', () => {
      this.playing = false;
    });
    this.audioElement.addEventListener('ended', () => {
      this.playing = false;
    });
  }
}
