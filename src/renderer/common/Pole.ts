import type { Object3D, Vector3Like } from "three";

import { RoadPole } from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

enum PoleEnum {
  Normal = 0
}
type PoleType = keyof typeof PoleEnum;

interface DataType {
  id: number;
  type: number; // 元素类型
  position: Vector3Like; // 模型中心位置
  rotation: Vector3Like; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "poleModel";
}

const gltfLoader = new GLTFLoader();

export default abstract class Pole extends RenderObject {
  static cacheModels = {} as Record<PoleType, Object3D>;
  static modelFiles: Record<PoleType, string> = {
    Normal: RoadPole
  };
  static preloading() {
    const proms = [];
    let key: keyof typeof Pole.modelFiles;
    for (key in Pole.modelFiles) {
      proms.push(Pole.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: PoleType) {
    try {
      const modelFile = Pole.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        Pole.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: DataType) {
    const { type } = modelData;
    const typeName = PoleEnum[type] as PoleType;

    if (Pole.cacheModels[typeName]) {
      const model = Pole.cacheModels[typeName].clone();
      model.renderOrder = this.renderOrder;
      model.userData.typeName = typeName;
      return model;
    }
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation } = modelData;
    model.position.copy(position);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
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
        if (model.userData.typeName !== PoleEnum[type]) {
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
