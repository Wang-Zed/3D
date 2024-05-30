import * as THREE from "three";
import { Timer } from "three/examples/jsm/misc/Timer";

export default abstract class BasicScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  timer: Timer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.timer = new Timer();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }
}
