import type { Object3D, Vector3Like } from "three";

import {
  TrafficLight1,
  TrafficLight2Horizontal,
  TrafficLight2Vertical,
  TrafficLight3Horizontal,
  TrafficLight3Vertical
} from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

enum TrafficLightEnum {
  TrafficLight1 = 1, // 一灯红绿灯
  TrafficLight2Vertical = 2, // 二灯红绿灯
  TrafficLight3Vertical = 3, // 三灯红绿灯
  TrafficLight2Horizontal = 4, // 二灯横向红绿灯
  TrafficLight3Horizontal = 5 // 三灯横向红绿灯
}
type TrafficLightType = keyof typeof TrafficLightEnum;

interface DataType {
  id: number;
  type: number; // 元素类型
  position: Vector3Like; // 模型中心位置
  rotation: Vector3Like; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "trafficLightModel";
}

const gltfLoader = new GLTFLoader();

export default abstract class TrafficLight extends RenderObject {
  static cacheModels = {} as Record<TrafficLightType, Object3D>;
  static modelFiles: Record<TrafficLightType, string> = {
    TrafficLight1: TrafficLight1,
    TrafficLight2Vertical: TrafficLight2Vertical,
    TrafficLight3Vertical: TrafficLight3Vertical,
    TrafficLight2Horizontal: TrafficLight2Horizontal,
    TrafficLight3Horizontal: TrafficLight3Horizontal
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof TrafficLight.modelFiles;
    for (key in TrafficLight.modelFiles) {
      proms.push(TrafficLight.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: TrafficLightType) {
    try {
      const modelFile = TrafficLight.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        TrafficLight.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: DataType) {
    const { type } = modelData;
    const typeName = TrafficLightEnum[type] as TrafficLightType;

    if (TrafficLight.cacheModels[typeName]) {
      const model = TrafficLight.cacheModels[typeName].clone();
      model.renderOrder = this.renderOrder;
      model.userData.typeName = typeName;
      return model;
    }
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    model.visible = this.enable;
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    data.data.forEach((modelData) => {
      const { id, type } = modelData;
      const model = this.modelList.get(id);
      if (model) {
        if (model.userData.typeName !== TrafficLightEnum[type]) {
          this.disposeObject(model);
          const newModel = this.createModel(modelData);
          if (newModel) {
            this.setModelAttributes(newModel, modelData);
            this.modelList.set(id, newModel);
            this.scene.add(newModel);
          }
        } else {
          this.setModelAttributes(model, modelData);
        }
      } else {
        const newModel = this.createModel(modelData);
        if (newModel) {
          this.setModelAttributes(newModel, modelData);
          this.modelList.set(id, newModel);
          this.scene.add(newModel);
        }
      }
    });
    this.checkModelByData(data.data);
  }
}
