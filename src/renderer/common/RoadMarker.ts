import type { Object3D, Vector3Like } from "three";

import {
  LeftRightTurn,
  LeftTurn,
  LeftTurnAndInterflow,
  LeftTurnUTurn,
  MaxSpeedLimit5,
  MaxSpeedLimit10,
  MaxSpeedLimit20,
  MaxSpeedLimit30,
  MaxSpeedLimit40,
  MaxSpeedLimit50,
  MaxSpeedLimit60,
  MaxSpeedLimit70,
  MaxSpeedLimit80,
  MaxSpeedLimit90,
  MaxSpeedLimit100,
  MaxSpeedLimit110,
  MaxSpeedLimit120,
  MaxSpeedLimitOther,
  MinSpeedLimit5,
  MinSpeedLimit10,
  MinSpeedLimit20,
  MinSpeedLimit30,
  MinSpeedLimit40,
  MinSpeedLimit50,
  MinSpeedLimit60,
  MinSpeedLimit70,
  MinSpeedLimit80,
  MinSpeedLimit90,
  MinSpeedLimit100,
  MinSpeedLimit110,
  MinSpeedLimit120,
  MinSpeedLimitOther,
  RhombicMark,
  RightTurn,
  RightTurnAndInterflow,
  SlowdownToGiveway,
  StopToGiveway,
  Straight,
  StraightLeftRight,
  StraightOrLeft,
  StraightOrRight,
  StraightULeft,
  StraightUTurn,
  UTurn
} from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

enum RoadMarkerEnum {
  Straight = 2,
  LeftTurn = 6,
  RightTurn = 9,
  LeftRightTurn = 11,
  StraightOrLeft = 3,
  StraightOrRight = 4,
  StraightLeftRight = 16,
  UTurn = 12,
  StraightUTurn = 5,
  LeftTurnUTurn = 7,
  LeftTurnAndInterflow = 8,
  RightTurnAndInterflow = 10,
  RhombicMark = 27,
  SlowdownToGiveway = 24,
  StopToGiveway = 23,
  StraightULeft = 17,
  MinSpeedLimit5 = 43,
  MinSpeedLimit10 = 44,
  MinSpeedLimit20 = 45,
  MinSpeedLimit30 = 46,
  MinSpeedLimit40 = 30,
  MinSpeedLimit50 = 31,
  MinSpeedLimit60 = 32,
  MinSpeedLimit70 = 47,
  MinSpeedLimit80 = 33,
  MinSpeedLimit90 = 34,
  MinSpeedLimit100 = 35,
  MinSpeedLimit110 = 48,
  MinSpeedLimit120 = 49,
  MinSpeedLimitOther = 50,
  MaxSpeedLimit5 = 51,
  MaxSpeedLimit10 = 52,
  MaxSpeedLimit20 = 53,
  MaxSpeedLimit30 = 54,
  MaxSpeedLimit40 = 36,
  MaxSpeedLimit50 = 37,
  MaxSpeedLimit60 = 38,
  MaxSpeedLimit70 = 55,
  MaxSpeedLimit80 = 39,
  MaxSpeedLimit90 = 40,
  MaxSpeedLimit100 = 41,
  MaxSpeedLimit110 = 56,
  MaxSpeedLimit120 = 42,
  MaxSpeedLimitOther = 57
}

type RoadMarkerType = keyof typeof RoadMarkerEnum;

interface DataType {
  id: number;
  type: number; // 元素类型
  position: Vector3Like; // 模型中心位置
  rotation: Vector3Like; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "roadMarkerModel";
}

const gltfLoader = new GLTFLoader();

export default abstract class RoadMarker extends RenderObject {
  static cacheModels = {} as Record<RoadMarkerType, Object3D>;
  static modelFiles: Record<RoadMarkerType, string> = {
    Straight: Straight,
    LeftTurn: LeftTurn,
    RightTurn: RightTurn,
    LeftRightTurn: LeftRightTurn,
    StraightOrLeft: StraightOrLeft,
    StraightOrRight: StraightOrRight,
    StraightLeftRight: StraightLeftRight,
    UTurn: UTurn,
    StraightUTurn: StraightUTurn,
    LeftTurnUTurn: LeftTurnUTurn,
    LeftTurnAndInterflow: LeftTurnAndInterflow,
    RightTurnAndInterflow: RightTurnAndInterflow,
    RhombicMark: RhombicMark,
    SlowdownToGiveway: SlowdownToGiveway,
    StopToGiveway: StopToGiveway,
    StraightULeft: StraightULeft,
    MinSpeedLimit5: MinSpeedLimit5,
    MinSpeedLimit10: MinSpeedLimit10,
    MinSpeedLimit20: MinSpeedLimit20,
    MinSpeedLimit30: MinSpeedLimit30,
    MinSpeedLimit40: MinSpeedLimit40,
    MinSpeedLimit50: MinSpeedLimit50,
    MinSpeedLimit60: MinSpeedLimit60,
    MinSpeedLimit70: MinSpeedLimit70,
    MinSpeedLimit80: MinSpeedLimit80,
    MinSpeedLimit90: MinSpeedLimit90,
    MinSpeedLimit100: MinSpeedLimit100,
    MinSpeedLimit110: MinSpeedLimit110,
    MinSpeedLimit120: MinSpeedLimit120,
    MinSpeedLimitOther: MinSpeedLimitOther,
    MaxSpeedLimit5: MaxSpeedLimit5,
    MaxSpeedLimit10: MaxSpeedLimit10,
    MaxSpeedLimit20: MaxSpeedLimit20,
    MaxSpeedLimit30: MaxSpeedLimit30,
    MaxSpeedLimit40: MaxSpeedLimit40,
    MaxSpeedLimit50: MaxSpeedLimit50,
    MaxSpeedLimit60: MaxSpeedLimit60,
    MaxSpeedLimit70: MaxSpeedLimit70,
    MaxSpeedLimit80: MaxSpeedLimit80,
    MaxSpeedLimit90: MaxSpeedLimit90,
    MaxSpeedLimit100: MaxSpeedLimit100,
    MaxSpeedLimit110: MaxSpeedLimit110,
    MaxSpeedLimit120: MaxSpeedLimit120,
    MaxSpeedLimitOther: MaxSpeedLimitOther
  };
  static preloading() {
    const proms = [];
    let key: keyof typeof RoadMarker.modelFiles;
    for (key in RoadMarker.modelFiles) {
      proms.push(RoadMarker.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: RoadMarkerType) {
    try {
      const modelFile = RoadMarker.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        RoadMarker.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: DataType) {
    const { type } = modelData;
    const typeName = RoadMarkerEnum[type] as RoadMarkerType;

    if (RoadMarker.cacheModels[typeName]) {
      const model = RoadMarker.cacheModels[typeName].clone();
      model.renderOrder = this.renderOrder;
      model.userData.typeName = typeName;
      return model;
    }
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation } = modelData;
    model.position.set(position.x, position.y, 0);
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
        if (model.userData.typeName !== RoadMarkerEnum[type]) {
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
