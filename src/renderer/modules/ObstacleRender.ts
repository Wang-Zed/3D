import { Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  AntiCollisionBarrel,
  AntiCollisionColumn,
  ConicalBarrel,
  SpeedBump,
  Tripod,
  WarningSign,
  WaterBarrierYellow
} from "@/assets/model";

import BasicTarget from "../basic_target";
// 障碍物与交通提示物
enum ObstacleTypeEnum {
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

interface ObstacleData {
  id: number;
  type: number; // 元素类型
  position: Vector3; // 模型中心位置
  rotation: Vector3; // 模型偏转值
}
type ObstacleType = keyof typeof ObstacleTypeEnum;
const cacheModels = {} as Record<ObstacleType, Object3D>;
const modelFiles: Record<ObstacleType, string> = {
  OBSTACLE_ISOLATION_BARREL: AntiCollisionBarrel, // 防撞桶 隔离桶
  OBSTACLE_CONE: ConicalBarrel, // 路锥,锥形桶
  OBSTACLE_POLE: AntiCollisionColumn, // 交通杆,隔离柱
  OBSTACLE_WARNING_TRIANGLE: Tripod, // 警告三角 三角标
  OBSTACLE_WaterBarrier: WaterBarrierYellow, // 水马
  OBSTACLE_CONSTRUCTION_ZONE_DIVERSION: WarningSign, // 施工区导流标志
  OBSTACLE_OTHER_DIVERSION: WarningSign, // 施工区导流标志
  OBSTACLE_SPEED_BUMP: SpeedBump
};

const gltfLoader = new GLTFLoader();

export default class ObstacleRender extends BasicTarget {
  topic = [
    "pilothmi_perception_obstacle_fusion object",
    "pilothmi_perception_obstacle_local"
  ];

  static preloading() {
    const proms = [];
    let key: keyof typeof modelFiles;
    for (key in modelFiles) {
      proms.push(ObstacleRender.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: ObstacleType) {
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

  setModelAttributes(model: Object3D, modelData: ObstacleData) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update(data: ObstacleData[]) {
    if (!data.length) {
      this.clear();
      return;
    }
    data.forEach((modelData) => {
      const { id, type } = modelData;
      const model = this.modelList[id];
      const typeName = ObstacleTypeEnum[type] as ObstacleType;
      if (model) {
        this.modelList[id] = model;
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
