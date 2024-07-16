import {
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  Vector3
} from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";

import { ALL_TOPICS, AUGMENTED_RENDER_MAP } from "@/constants/topic";
import type { AUGMENTED_RENDER_TYPE } from "@/typings";
import log from "@/utils/log";
import { VIEW_WS } from "@/utils/websocket";

import type { EgoCarUpdateData } from "../common";
import type RenderObject from "../RenderObject";
import RenderScene from "../RenderScene";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import FreespaceRender from "./FreespaceRender";
import ObstacleRender from "./ObstacleRender";
import ParticipantRender from "./ParticipantRender";
import PoleRender from "./PoleRender";
import PolylineRender from "./PolylineRender";
import RoadMarkerRender from "./RoadMarkerRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Augmented extends RenderScene {
  createRender: {
    [K in AUGMENTED_RENDER_TYPE]: RenderObject[];
  };

  ips: string[] = [];

  ground = new Group();

  constructor() {
    super();

    this.createRender = {
      car_pose: AUGMENTED_RENDER_MAP.car_pose.map(
        (topic) => new EgoCarRender(this.scene, topic)
      ),
      crosswalk: AUGMENTED_RENDER_MAP.crosswalk.map(
        (topic) => new CrosswalkRender(this.scene, topic)
      ),
      freespace: AUGMENTED_RENDER_MAP.freespace.map(
        (topic) => new FreespaceRender(this.scene, topic)
      ),
      obstacleModel: AUGMENTED_RENDER_MAP.obstacleModel.map(
        (topic) => new ObstacleRender(this.scene, topic)
      ),
      participantModel: AUGMENTED_RENDER_MAP.participantModel.map(
        (topic) => new ParticipantRender(this.scene, topic)
      ),
      polyline: AUGMENTED_RENDER_MAP.polyline.map(
        (topic) => new PolylineRender(this.scene, topic)
      ),
      poleModel: AUGMENTED_RENDER_MAP.poleModel.map(
        (topic) => new PoleRender(this.scene, topic)
      ),
      roadMarkerModel: AUGMENTED_RENDER_MAP.roadMarkerModel.map(
        (topic) => new RoadMarkerRender(this.scene, topic)
      ),
      trafficLightModel: AUGMENTED_RENDER_MAP.trafficLightModel.map(
        (topic) => new TrafficLightRender(this.scene, topic)
      ),
      trafficSignalModel: AUGMENTED_RENDER_MAP.trafficSignalModel.map(
        (topic) => new TrafficSignalRender(this.scene, topic)
      )
    };

    this.addEvents();

    this.preload();
  }

  addEvents() {
    this.on("enable", (data) => {
      const type = data.type as AUGMENTED_RENDER_TYPE;
      const topicMap = this.createRender[type];
      const render = topicMap.find((render) => render.topic === data.topic);
      if (!render) {
        log.danger(type, `[${data.topic}] not found`);
      } else {
        render.setEnable(data.enable);
      }
    });
    let updatedPos = false;

    const prePos = new Vector3();

    VIEW_WS.on(ALL_TOPICS.CAR_POSE, (data: { data: EgoCarUpdateData }) => {
      const [{ position, rotation }] = data.data.data;
      if (!updatedPos) {
        this.ground.position.copy(position);
        this.ground.rotation.z = rotation.z;
        updatedPos = true;
      }

      const deltaPos = new Vector3().copy(position).sub(prePos);

      this.camera.position.add(deltaPos);

      this.controls.target.add(deltaPos);

      prePos.copy(position);

      this.updateControls();
    });

    VIEW_WS.on(ALL_TOPICS.CONN_LIST, (data) => {
      this.ips = (data as any).conn_list || [];
    });
  }

  preload() {
    EgoCarRender.preloading().then((res) => {
      res.forEach((item) => {
        if (item.status === "fulfilled") {
          this.scene.add(item.value);
        }
      });
    });
    const preloadArray = [
      ObstacleRender,
      ParticipantRender,
      TrafficLightRender,
      TrafficSignalRender,
      RoadMarkerRender
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.updateControler();
    this.setScene();
  }

  updateControler() {
    this.controls.target.set(3, 0, 6);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.updateControls();

    this.controls.addEventListener("end", this.resetCamera);
  }

  createGround() {
    const geometry = new PlaneGeometry(500, 500);
    const material = new MeshPhongMaterial({
      color: 0x525862,
      side: DoubleSide
    });
    const plane = new Mesh(geometry, material);
    plane.position.z = -0.01;

    const reflector = new Reflector(geometry, {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    });

    this.scene.add(reflector, plane);
  }

  setScene() {
    const size = 1000;
    const geometry = new PlaneGeometry(size / 2, size / 2);
    const material = new MeshBasicMaterial({
      color: 0x525862,
      side: DoubleSide
    });
    const ground = new Mesh(geometry, material);
    ground.position.z = -0.3;
    this.ground.add(ground);
    this.scene.add(this.ground);
  }

  dispose() {
    Object.values(this.createRender).forEach((renders) => {
      renders.forEach((render) => {
        render.dispose();
      });
    });
    this.removeAllListeners();
    VIEW_WS.off(ALL_TOPICS.CAR_POSE);
    VIEW_WS.off(ALL_TOPICS.CONN_LIST);
    this.controls.removeEventListener("end", this.resetCamera);
    super.dispose();
  }
}
