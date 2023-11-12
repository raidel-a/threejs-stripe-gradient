import * as THREE from "three";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import colors from "nice-color-palettes";

// const index = Math.floor(Math.random() * colors.length);
const index = 89;
let palette = colors[index];
palette = palette.map((color) => new THREE.Color(color)); 


// const palette = [
// 	new THREE.Color( 78/225,  12/225, 112/225 ),   // Dark Purple
// 	new THREE.Color( 70/225,  20/225, 99/225 ),   // 
// 	new THREE.Color( 54/225,  1/225,  73/225 ),  // 
// 	new THREE.Color( 45/225,  40/225,  60/225 ),  // 
// 	new THREE.Color( 37/225,  0/225, 48/225 ),   // 
// ];

const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    const context = this;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xeeeeee, 1);
    // this.renderer.physicallyCorrectLights = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 4);
    this.time = 0;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.isPlaying = true;

    // this.addMesh();
    this.addObjects();
    this.addLights();
    this.resize();
    this.render();
    this.setupResize();

    window.addEventListener(
      "resize",
      debounce(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }, 500),
      { trailing: true }
    );
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uColor: { value: palette },
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      // wireframe: true,
    });

    this.geometry = new THREE.PlaneGeometry(9, 5, 100, 100);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  addLights() {
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);
    // light.castShadow = true;

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(5, 3, 5);
    this.scene.add(light2);
    // light2.castShadow = true;
  }

  stop() {
    this.isPlaying = false;
  }

  start() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.render();
    }
  }

  render() {
    // console.log(this.camera.projectionMatrix);

    if (!this.isPlaying) return;
    this.time += 0.0001;
    this.material.uniforms.time.value = this.time;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
