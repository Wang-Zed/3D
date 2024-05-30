import { ElMessage, type MessageHandler } from "element-plus";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Reflector } from "three/examples/jsm/objects/Reflector";

import car from "@/assets/model/participant/自车.gltf?url";
import monitor from "@/store/monitor";
import { VIEW_WS } from "@/store/websocket";
import { debounce, resizeListener } from "@/utils";

import BasicScene from "./basic_scene";
import BasicTarget from "./basic_target";
import {
  CrosswalkRender,
  FreespaceRender,
  ObstacleRender,
  ParticipantRender,
  TrafficLightRender,
  TrafficSignalRender
} from "./modules";

// 监听3d场景绘制进度
let hideThreeLoading: MessageHandler | null;
THREE.DefaultLoadingManager.onStart = () => {
  if (!hideThreeLoading) {
    hideThreeLoading = ElMessage.info({
      message: "3d场景加载中",
      duration: 0
    });
  }
};
THREE.DefaultLoadingManager.onLoad = () => {
  if (hideThreeLoading) {
    hideThreeLoading.close();
    hideThreeLoading = null;
  }
};

const gltfLoader = new GLTFLoader();

class Renderer extends BasicScene {
  initialized: boolean;

  resizeOb?: ResizeObserver;
  controls?: OrbitControls;

  createRender: BasicTarget[];

  constructor() {
    super();
    this.initialized = false;

    this.camera.fov = 60;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(-22, 0, 12);

    this.createRender = [
      new ObstacleRender(this.scene),
      new ParticipantRender(this.scene),
      new FreespaceRender(this.scene),
      new TrafficLightRender(this.scene),
      new TrafficSignalRender(this.scene),
      new CrosswalkRender(this.scene)
    ];

    this.preload().then(() => {
      this.registerModelRender();
    });
  }

  preload() {
    const preloadArray = [
      ObstacleRender,
      ParticipantRender,
      TrafficLightRender,
      TrafficSignalRender
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    this.initialized = true;
    const container = document.getElementById(canvasId);
    if (!container) throw new Error(`Container not found: ${canvasId}`);
    const { clientWidth: width, clientHeight: height } = container;

    this.updateDimension(width, height);

    this.resizeOb = resizeListener(
      container,
      debounce(() => {
        this.updateDimension(container.clientWidth, container.clientHeight);
      }, 200)
    );

    container.appendChild(this.renderer.domElement);

    this.createControler();

    this.createLights();

    this.setScene();

    gltfLoader.load(car, (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);
    });

    this.render();
  }

  updateDimension(width: number, height: number) {
    if (!this.initialized) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  resetCamera = debounce(() => {
    if (!this.controls) return;
    const tween = new Tween(this.camera.position);
    tween
      .to(this.controls.position0)
      .easing(Easing.Quadratic.InOut)
      .onStart(() => {
        if (!this.controls) return;
        this.controls.enabled = false;
      })
      .onComplete(() => {
        if (!this.controls) return;
        this.controls.enabled = true;
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

  createControler() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(3, 0, 6);
    this.controls.enablePan = false;
    // this.controls.enableDamping = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.saveState();

    this.controls.addEventListener("end", this.resetCamera);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    hemisphereLight.position.set(0, 0, 1);
    this.scene.add(ambientLight, hemisphereLight);
  }

  createGround() {
    const geometry = new THREE.PlaneGeometry(500, 500);
    const material = new THREE.MeshPhongMaterial({
      color: 0x525862,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = 0.005;

    const reflector = new Reflector(geometry, {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    this.scene.add(reflector, plane);
  }

  setScene() {
    // this.scene.fog = new THREE.FogExp2(0x525862, 0.02);
    const size = 1000;
    const geometry = new THREE.CylinderGeometry(size / 2, size / 2, size);
    const material = new THREE.MeshBasicMaterial({
      color: 0x525862,
      side: THREE.DoubleSide
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.z = geometry.parameters.height / 2;
    cylinder.rotation.x = Math.PI / 2;

    const reflector = new Reflector(new THREE.CircleGeometry(size / 2), {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    reflector.position.z = 0.005;

    this.scene.add(cylinder, reflector);
  }

  registerModelRender() {
    for (const instance of this.createRender) {
      instance.topic.forEach((topic) => {
        VIEW_WS.registerTargetMsg(topic, instance.update.bind(instance));
      });
    }
  }

  renderLoop() {
    this.timer.update();
    const delta = this.timer.getDelta();
    this.controls?.update(delta);

    if (this.scene.userData.mixers) {
      Object.values<THREE.AnimationMixer>(this.scene.userData.mixers).forEach(
        (mixer) => {
          mixer.update(delta);
        }
      );
    }

    super.render();
    monitor.updateFps();
  }

  render() {
    this.renderer.setAnimationLoop(this.renderLoop.bind(this));
  }

  dispose() {
    super.dispose();
    this.resizeOb?.disconnect();
    this.controls?.removeEventListener("end", this.resetCamera);
    this.controls?.dispose();
    this.initialized = false;
  }
}

export default Renderer;
