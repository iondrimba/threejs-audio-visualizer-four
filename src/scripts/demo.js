import Loader from './loader';
import OrbitControls from 'threejs-controls/OrbitControls';
import { TweenMax, Power2 } from 'gsap';

class App {
  constructor() {
    this.count = 0;
    this.songFile = 'autotron.mp3';
    this.percent = 0;
    this.playing = false;
    this.volume = 0.01;
    this.objects = [];
    this.sceneBackGroundColor = 0xfff700;
    this.objectsColor = 0xae12d4;
    this.rowTiles = [];
    this.cols = 0;
    this.groupTiles = new THREE.Object3D();

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
      this.animate();
      this.playSound(file);

      this.timer = 600;
      let interval = setInterval(() => {
        this.addTilesRow(this.rowTiles);
        this.removeOldTiles(this.rowTiles);
      }, this.timer);
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
    let positions = [];
    const gutter = 1.05;
    let index = 0;

    const hasPrev = tiles.length && tiles[tiles.length - 1][0].position;
    let prevPos = 0;

    if (tiles.length) {
      prevPos = tiles[tiles.length - 1][0].position.x + gutter;
    }

    for (let col = 0; col < cols; col++) {
      positions[col] = [];
      tiles.push([]);

      for (let row = 0; row < rows; row++) {
        const pos = {
          z: row,
          y: 3,
          x: hasPrev ? prevPos : col,
          rX: this.radians(90)
        }

        positions[col][row] = pos;
        const plane = this.createObj(this.objectsColor);

        plane.scale.set(1, 1, 0.01);

        if (col > 0) {
          pos.x = (positions[col - 1][row].x * plane.size) + gutter;
        }

        if (row > 0) {
          pos.z = (positions[col][row - 1].z * plane.size) + gutter;
        }

        plane.position.set(pos.x, pos.y, pos.z);

        plane.rotateX(pos.rX);


        this.groupTiles.add(plane);

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
      this.audioElement.play();

      this.playing = true;
    }, 1000);
  }

  drawWave() {
    if (this.playing) {

      this.analyser.getByteFrequencyData(this.frequencyData);
      let index = 0;
      for (var i = 0; i < this.rowTiles.length; i++) {
        for (var j = 0; j < this.rowTiles[i].length; j++) {
          var p = this.frequencyData[index];
          var s = this.rowTiles[i][j];
          var z = s.scale;

          TweenMax.to(z, .2, {
            z: p / 50 <= 0 ? 0.01 : p / 50
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

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneBackGroundColor);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.groupTiles.position.set(10, 0, -5);
    this.scene.add(this.groupTiles);

    document.body.appendChild(this.renderer.domElement);

    document.body.onmouseup = () => {
      console.log('up');
      document.body.style.cursor = '-moz-grab';
      document.body.style.cursor = '-webkit-grab';
    };
    document.body.onmousedown = () => {
      console.log('down');
      document.body.style.cursor = '-moz-grabbing';
      document.body.style.cursor = '-webkit-grabbing';
    }
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(20, 20, -20);
    this.scene.add(this.camera);
  }

  addCameraControls() {
    this.controls = new OrbitControls(this.camera);
  }

  addGrid() {
    const size = 25;
    const divisions = 25;

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.set(0, 0, 0);
    gridHelper.material.opacity = 0;
    gridHelper.material.transparent = true;

    this.scene.add(gridHelper);
  }

  createObj(color) {
    const size = .5;
    const geometry = new THREE.BoxGeometry(size, size, 5);
    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: 0x0
    });
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    obj.receiveShadow = true;
    obj.position.z = -2.5;
    obj.size = 1;

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
    const planeGeometry = new THREE.PlaneGeometry(250, 250);
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
