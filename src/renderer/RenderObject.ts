import {
  AnimationMixer,
  Mesh,
  type Object3D,
  type Scene,
  SkinnedMesh
} from "three";

import type { ALL_TOPICS } from "@/constants/topic";
import renderOrderer from "@/utils/three/renderOrderer";

interface UpdateData {
  data: any;
  defaultEnable: boolean;
  group: string;
  style: Record<string, any>;
  timestamp_nsec: number;
  topic: string;
  type: any;
}

export default abstract class RenderObject {
  scene: Scene;
  abstract topic: ALL_TOPICS;

  #enable = true;
  get enable() {
    return this.#enable;
  }
  set enable(enable: boolean) {
    if (enable === this.#enable) return;
    this.#enable = enable;
    this.modelList.forEach((model) => {
      model.visible = enable;
    });
  }

  modelList: Map<string | number, Object3D>;

  renderOrder = renderOrderer.get();

  constructor(scene: Scene) {
    this.scene = scene;
    this.enable = true;

    this.modelList = new Map();
  }

  setEnable(enable: boolean) {
    this.enable = enable;
  }

  toggleEnable() {
    this.enable = !this.enable;
  }

  disposeObject(obj: Object3D) {
    obj.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.dispose();
          });
        } else {
          child.material.dispose();
        }
      }
      if (child instanceof SkinnedMesh) {
        child.skeleton.dispose();
      }
    });

    this.scene.remove(obj);
    const mixerKey = obj.userData.typeName + obj.userData.id + "Mixer";
    const mixer = this.scene.userData.mixers?.[mixerKey] as AnimationMixer;
    if (mixer) {
      mixer.stopAllAction();
      obj.animations?.forEach((animation) => {
        mixer.uncacheAction(animation);
      });
      delete this.scene.userData.mixers[mixerKey];
    }
  }

  clear(list = this.modelList) {
    list.forEach(this.disposeObject.bind(this));
    list.clear();
  }

  checkModelByData<D extends Array<any>>(data: D, list = this.modelList) {
    list.forEach((model, id) => {
      if (data.every((item) => item.id !== id)) {
        this.disposeObject(model);
        list.delete(id);
      }
    });
  }

  dispose() {
    renderOrderer.delete(this.renderOrder);
    this.modelList.forEach(this.disposeObject.bind(this));
    this.modelList.clear();
  }

  abstract update(data: UpdateData): void;
}
