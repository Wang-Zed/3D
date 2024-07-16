import type { Object3D, Vector3Like } from "three";

import { EgoCar as EgoCarModel } from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

enum EgoCarTypeEnum {
  EGO_CAR = "EGO_CAR"
}
type EgoCarType = keyof typeof EgoCarTypeEnum;

interface DataType {
  posWGS84: Vector3Like;
  position: Vector3Like;
  rotation: Vector3Like;
}

const gltfLoader = new GLTFLoader();

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "car_pose";
}

export default abstract class EgoCar extends RenderObject {
  static cacheModels = {} as Record<EgoCarType, Object3D>;
  static modelFiles: Record<EgoCarType, string> = {
    EGO_CAR: EgoCarModel
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof EgoCar.modelFiles;
    for (key in EgoCar.modelFiles) {
      proms.push(EgoCar.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: EgoCarType) {
    try {
      const modelFile = EgoCar.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        EgoCar.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel() {
    if (EgoCar.cacheModels[EgoCarTypeEnum.EGO_CAR]) {
      const model = EgoCar.cacheModels[EgoCarTypeEnum.EGO_CAR];
      model.renderOrder = this.renderOrder;
      return model;
    }
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, 0);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update(data: UpdateData) {
    if (!data.data.length) return;
    data.data.forEach((item) => {
      const model = this.modelList.get(EgoCarTypeEnum.EGO_CAR);
      if (model) {
        this.setModelAttributes(model, item);
      } else {
        const newModel = this.createModel();
        if (newModel) {
          this.setModelAttributes(newModel, item);
          this.modelList.set(EgoCarTypeEnum.EGO_CAR, newModel);
        }
      }
    });
  }
}
