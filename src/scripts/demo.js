import Loader from './loader';
import OrbitControls from 'threejs-controls/OrbitControls';
import { TweenMax, Power2 } from 'gsap';

class App {
  constructor() {
    this.count = 0;
    this.songFile = 'autotron.mp3';
    this.percent = 0;
    this.playing = false;
    this.volume = 0.001;
    this.objects = [];
    this.sceneBackGroundColor = 0xfff700;
    this.objectsColor = 0xae12d4;

    this.loader = new Loader();
    this.loader.progress((percent) => { this.progress(percent); });
    this.loaderBar = document.querySelector('.loader');
    this.loader.load(this.songFile);
    this.loader.complete = this.complete.bind(this);
  }

  progress(percent) {
    this.loaderBar.style.transform = `scale(${percent / 100}, 1)`;
    if (percent === 100) {
      setTimeout(() => {
        requestAnimationFrame(() => {
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
      this.addGrid();
      this.addTiles();
      this.addAnchor();
      //this.createRingOfSquares(20, 1, this.objectsColor, this.firstRing);
      this.animate();
      this.playSound(file);
    }, 200);
  }

  addTiles() {

    const rows = 4;
    const cols = 30;
    const positions = [];
    const gutter = 1.05;

    for (let row = 0; row < rows; row++) {
      positions[row] = [];
      for (let col = 0; col < cols; col++) {
        const pos = {
          z: row,
          y: 1,
          x: col,
          rX: this.radians(90)
        }

        positions[row][col] = pos;

        const plane = this.createTile(this.objectsColor);

        if (row > 0) {
          pos.z = (positions[row - 1][col].z * plane.size) + gutter;
        }

        if (col > 0) {
          pos.x = (positions[row][col - 1].x * plane.size) + gutter;
        }

        plane.position.set(pos.x, pos.y, pos.z);

        plane.rotateX(pos.rX);

        this.scene.add(plane);

        TweenMax.delayedCall(row * col / 10, () => {
          TweenMax.to(plane.rotation, .2, {
            y: this.radians(180)
          });
        });
      }
    }

  }

  playSound(file) {
    setTimeout(() => {
      this.audioElement.src = file;
      this.audioElement.load();
      this.audioElement.play();

      this.playing = true;
    }, 1000);
  }

  drawWave() {
    if (this.playing) {

      this.analyser.getByteFrequencyData(this.frequencyData);

      for (var i = 0; i < this.total; i++) {
        var p = this.frequencyData[i];
        var s = this.objects[i];
        var z = s.position;

        TweenMax.to(z, .2, {
          y: p / 20
        });
      }
    }

    this.moveRingGroup(this.firstRing, .01);
  }

  addSoundControls() {
    this.btnPlay = document.querySelector('.play');
    this.btnPause = document.querySelector('.pause');

    this.btnPlay.addEventListener('click', () => {
      this.audioElement.play();
      this.btnPlay.classList.remove('control-show');
      this.btnPause.classList.add('control-show');

    });

    this.btnPause.addEventListener('click', () => {
      this.audioElement.pause();
      this.btnPause.classList.remove('control-show');
      this.btnPlay.classList.add('control-show');
    });
  }

  createRingOfSquares(count, radius, color, group) {

    for (let index = 0; index < count; index++) {

      var l = 360 / count;
      var pos = this.radians(l * index);
      var obj = this.createObj(color);
      var distance = (radius * 2);

      var sin = Math.sin(pos) * distance;
      var cos = Math.cos(pos) * distance;

      obj.position.set(sin, 0, cos);

      obj.rotateY(pos);

      this.objects.push(obj);

      group.add(obj);
    }

    this.scene.add(group);

    this.total = this.objects.length;
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneBackGroundColor);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(-10, 5, 10);

    this.scene.add(this.camera);

    var helper = new THREE.CameraHelper(this.camera);
    helper.visible = true;
  }

  addCameraControls() {
    this.controls = new OrbitControls(this.camera);
  }

  addGrid() {
    const size = 25;
    const divisions = 25;

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.set(0, 0, 0);
    gridHelper.material.opacity = 0.50;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  createObj(color) {
    var size = .5;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshLambertMaterial({
      color: color
    });

    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    obj.receiveShadow = true;

    return obj;
  }

  createTile(color) {
    const size = 1;
    const width = size;
    const height = size;
    const segmentsW = 5;
    const segmentsH = segmentsW;

    const geometry = new THREE.PlaneGeometry(width, height, segmentsW, segmentsH);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.FrontSide });
    const plane = new THREE.Mesh(geometry, material);

    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.size = size;
    return plane;
  }

  onResize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    this.camera.aspect = ww / wh;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(ww, wh);
  }

  addFloor() {
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.08 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    planeGeometry.rotateX(- Math.PI / 2);

    plane.position.y = -1;
    plane.receiveShadow = true;

    this.scene.add(plane);
  }

  moveRingGroup(group, value) {
    group.rotation.y += value;
  }

  addSpotLight() {
    const spotLight = new THREE.SpotLight(0xffffff);

    spotLight.position.set(0, 20, 1);
    spotLight.castShadow = true;

    this.scene.add(spotLight);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);
  }

  addAnchor() {
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.anchor = new THREE.Mesh(geometry, material);
    this.scene.add(this.anchor);
  }

  animate() {
    this.controls.update();

    this.camera.position.x += .05;
    this.anchor.position.x += .05;
    this.camera.lookAt(this.anchor.position);
    this.drawWave();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }

  radians(degrees) {
    return degrees * Math.PI / 180;
  }

  setupAudio() {
    this.audioElement = document.getElementById('audio');
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();

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

window.app = new App();

window.addEventListener('resize', app.onResize.bind(app));
