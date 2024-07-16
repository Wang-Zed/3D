import type { Object3D, Vector3Like } from "three";

import {
  AntiCollisionBarrel,
  AntiCollisionColumn,
  ConicalBarrel,
  SpeedBump,
  Tripod,
  WarningSign,
  WaterBarrierYellow
} from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

// 障碍物与交通提示物
enum ObstacleEnum {
  OBSTACLE_ISOLATION_BARREL = 294, // 障碍物隔离桶   2 隔离桶
  // OBSTACLE_BARRIER = 295, // 路栏  5
  OBSTACLE_CONE = 296, // 路锥   0 锥形桶
  OBSTACLE_POLE = 297, // 交通杆 1  隔离柱
  OBSTACLE_WARNING_TRIANGLE = 298, // 警告三角   3 三角标
  OBSTACLE_WaterBarrier = 295, // 4  水马
  OBSTACLE_CONSTRUCTION_ZONE_DIVERSION = 300, // 6 施工区导流标志
  OBSTACLE_OTHER_DIVERSION = 301, // 7 施工区导流标志
  OBSTACLE_SPEED_BUMP = 302 //  减速带
}
type ObstacleType = keyof typeof ObstacleEnum;

interface DataType {
  id: number;
  type: number; // 元素类型
  position: Vector3Like; // 模型中心位置
  rotation: Vector3Like; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "obstacleModel";
}

const gltfLoader = new GLTFLoader();

export default abstract class Obstacle extends RenderObject {
  static cacheModels = {} as Record<ObstacleType, Object3D>;
  static modelFiles: Record<ObstacleType, string> = {
    OBSTACLE_ISOLATION_BARREL: AntiCollisionBarrel, // 防撞桶 隔离桶
    OBSTACLE_CONE: ConicalBarrel, // 路锥,锥形桶
    OBSTACLE_POLE: AntiCollisionColumn, // 交通杆,隔离柱
    OBSTACLE_WARNING_TRIANGLE: Tripod, // 警告三角 三角标
    OBSTACLE_WaterBarrier: WaterBarrierYellow, // 水马
    OBSTACLE_CONSTRUCTION_ZONE_DIVERSION: WarningSign, // 施工区导流标志
    OBSTACLE_OTHER_DIVERSION: WarningSign, // 施工区导流标志
    OBSTACLE_SPEED_BUMP: SpeedBump
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof Obstacle.modelFiles;
    for (key in Obstacle.modelFiles) {
      proms.push(Obstacle.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: ObstacleType) {
    try {
      const modelFile = Obstacle.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        Obstacle.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: DataType) {
    const { type } = modelData;
    const typeName = ObstacleEnum[type] as ObstacleType;
    if (Obstacle.cacheModels[typeName]) {
      const model = Obstacle.cacheModels[typeName].clone();
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
        if (model.userData.typeName !== ObstacleEnum[type]) {
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
          this.scene.add(newModel);
          this.modelList.set(id, newModel);
        }
      }
    });
    this.checkModelByData(data.data);
  }
}
