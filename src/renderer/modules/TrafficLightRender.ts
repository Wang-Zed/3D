import { Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  TrafficLight1,
  TrafficLight2Horizontal,
  TrafficLight2Vertical,
  TrafficLight3Horizontal,
  TrafficLight3Vertical
} from "@/assets/model";

import BasicTarget from "../basic_target";

enum TrafficLightTypeEnum {
  TrafficLight1 = 1, // 一灯红绿灯
  TrafficLight2Vertical = 2, // 二灯红绿灯
  TrafficLight3Vertical = 3, // 三灯红绿灯
  TrafficLight2Horizontal = 4, // 二灯横向红绿灯
  TrafficLight3Horizontal = 5 // 三灯横向红绿灯
}

interface TrafficLightData {
  id: number;
  type: number; // 元素类型
  position: Vector3; // 模型中心位置
  rotation: Vector3; // 模型偏转值
}

type TrafficLightType = keyof typeof TrafficLightTypeEnum;

const cacheModels = {} as Record<TrafficLightType, Object3D>;

const modelFiles: Record<TrafficLightType, string> = {
  TrafficLight1: TrafficLight1,
  TrafficLight2Vertical: TrafficLight2Vertical,
  TrafficLight3Vertical: TrafficLight3Vertical,
  TrafficLight2Horizontal: TrafficLight2Horizontal,
  TrafficLight3Horizontal: TrafficLight3Horizontal
};

const gltfLoader = new GLTFLoader();

export default class TrafficLightRender extends BasicTarget {
  topic = ["pilothmi_traffic_light_local"];

  static preloading() {
    const proms = [];
    let key: keyof typeof modelFiles;
    for (key in modelFiles) {
      proms.push(TrafficLightRender.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: TrafficLightType) {
    try {
      const modelFile = modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        cacheModels[type] = model;
        return model;
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  setModelAttributes(model: Object3D, modelData: TrafficLightData) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update(data: TrafficLightData[]) {
    if (!data.length) {
      this.clear();
      return;
    }
    data.forEach((modelData) => {
      const { id, type } = modelData;
      const model = this.modelList[id];
      const typeName = TrafficLightTypeEnum[type] as TrafficLightType;
      if (model) {
        this.setModelAttributes(model, modelData);
      } else if (cacheModels[typeName]) {
        const newModel = cacheModels[typeName].clone();
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList[id] = newModel;
      }
    });
    Object.keys(this.modelList).forEach((id) => {
      if (!data.find((item) => item.id === +id)) {
        this.disposeObject(this.modelList[id]);
        delete this.modelList[id];
      }
    });
  }
}
