import { ElMessage, type MessageHandler } from "element-plus";
import EventEmitter from "eventemitter3";
import { debounce } from "lodash-es";
import {
  AmbientLight,
  AnimationMixer,
  DefaultLoadingManager,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module";
import { Timer } from "three/examples/jsm/misc/Timer";

import type { ALL_RENDER_EVENT } from "@/typings";
import Stats from "@/utils/three/libs/Stats";

// 监听3d场景绘制进度
let hideThreeLoading: MessageHandler | null;
DefaultLoadingManager.onStart = () => {
  if (!hideThreeLoading) {
    hideThreeLoading = ElMessage.info({
      message: "3d场景加载中",
      duration: 0
    });
  }
};
DefaultLoadingManager.onLoad = () => {
  if (hideThreeLoading) {
    hideThreeLoading.close();
    hideThreeLoading = null;
  }
};

export default abstract class Renderer<
  EventTypes extends EventEmitter.ValidEventTypes = ALL_RENDER_EVENT,
  Context extends any = any
> extends EventEmitter<EventTypes, Context> {
  initialized: boolean;

  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;

  timer: Timer;

  resizeOb?: ResizeObserver;

  stats: Stats;

  constructor() {
    super();

    this.initialized = false;

    this.renderer = new WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(-22, 0, 12);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.updateControls();

    this.timer = new Timer();

    this.stats = new Stats();
  }

  initialize(canvasId: string) {
    this.initialized = true;
    const container = document.getElementById(canvasId);
    if (!container) throw new Error(`Container not found: ${canvasId}`);
    const { clientWidth: width, clientHeight: height } = container;

    this.updateDimension(width, height);
    this.resizeOb = new ResizeObserver(
      debounce(() => {
        this.updateDimension(container.clientWidth, container.clientHeight);
      }, 200)
    );
    this.resizeOb.observe(container);

    container.appendChild(this.renderer.domElement);

    this.createLights();

    this.render();
  }

  resetCamera = debounce(() => {
    const tween = new Tween({
      position: this.camera.position,
      quaternion: this.camera.quaternion
    });

    tween
      .to({
        position: this.camera.userData.position,
        quaternion: this.camera.userData.quaternion
      })
      .easing(Easing.Quadratic.InOut)
      .onStart(() => {
        this.controls.enabled = false;
      })
      .onComplete(() => {
        this.controls.enabled = true;
        this.controls.reset();
      })
      .start();

    let rafId: number;
    const tweenAnimate = () => {
      rafId = requestAnimationFrame(() => {
        const playing = tween.update();
        if (playing) tweenAnimate();
        else cancelAnimationFrame(rafId);
      });
    };
    tweenAnimate();
  }, 2500);

  updateControls() {
    this.controls.update();
    this.controls.saveState();

    this.camera.updateProjectionMatrix();
    this.camera.userData = {
      position: this.camera.position.clone(),
      quaternion: this.camera.quaternion.clone()
    };
  }

  updateDimension(width: number, height: number) {
    if (!this.initialized) return;
    this.camera.aspect = width / height;
    this.updateControls();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.8);
    const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 1);
    hemisphereLight.position.set(0, 0, 1);
    this.scene.add(ambientLight, hemisphereLight);
  }

  renderLoop() {
    this.timer.update();
    const delta = this.timer.getDelta();

    if (this.scene.userData.mixers) {
      Object.values<AnimationMixer>(this.scene.userData.mixers).forEach(
        (mixer) => {
          mixer.update(delta);
        }
      );
    }

    this.renderer.render(this.scene, this.camera);

    this.stats.update();
  }

  render() {
    this.renderer.setAnimationLoop(this.renderLoop.bind(this));
  }

  dispose() {
    this.renderer.domElement.remove();
    this.renderer.dispose();
    this.controls.dispose();
    this.resizeOb?.disconnect();
    this.stats.dispose();
    this.initialized = false;
  }
}
