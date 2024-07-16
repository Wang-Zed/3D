import type { Object3D, Vector3Like } from "three";

import {
  Attention_to_children,
  Attention_to_Pedestrians,
  Bus_lane,
  Close_to_toll_gate,
  End_speed_limit_5,
  End_speed_limit_10,
  End_speed_limit_15,
  End_speed_limit_20,
  End_speed_limit_25,
  End_speed_limit_30,
  End_speed_limit_35,
  End_speed_limit_40,
  End_speed_limit_50,
  End_speed_limit_60,
  End_speed_limit_70,
  End_speed_limit_80,
  End_speed_limit_90,
  End_speed_limit_100,
  End_speed_limit_110,
  End_speed_limit_120,
  EndOfProhibitionOnOvertaking,
  Lane_changed,
  Left_turn_and_forward_Lane,
  Left_turn_and_U_turn_Lane,
  Left_turn_lane,
  Merge_Left,
  Merge_right,
  Minimum_speed_limit_50,
  Minimum_speed_limit_60,
  Minimum_speed_limit_70,
  Minimum_speed_limit_80,
  Minimum_speed_limit_90,
  Minimum_speed_limit_100,
  Minimum_speed_limit_110,
  No_Audible_Warning,
  No_left_turn,
  No_right_turn,
  No_U_turn,
  Number_of_lanes_becoming_less,
  OvertakingProhibited,
  pedestrian_crossing,
  Ramp,
  Right_turn_and_forward_Lane,
  Right_turn_lane,
  Slow_down_and_give_way,
  Speed_limit_5,
  Speed_limit_10,
  Speed_limit_15,
  Speed_limit_20,
  Speed_limit_25,
  Speed_limit_30,
  Speed_limit_35,
  Speed_limit_40,
  Speed_limit_50,
  Speed_limit_60,
  Speed_limit_70,
  Speed_limit_80,
  Speed_limit_90,
  Speed_limit_100,
  Speed_limit_110,
  Speed_limit_120,
  Stop_sign,
  Straight_lane,
  U_turn_Lane,
  Variable_sign_others,
  Work_zone_sign,
  X_enter,
  X_entry,
  X_height,
  X_landr,
  X_parking,
  X_straight,
  X_weight,
  X_width
} from "@/assets/model";
import type { UpdateDataTool } from "@/typings";
import GLTFLoader from "@/utils/three/loaders/GLTFLoader";

import RenderObject from "../RenderObject";

enum TrafficSignalEnum {
  Unknown = 0, //未知
  RoadWorks = 1, //道路施工
  Stop = 2, //停止标示
  OvertakingProhibited = 3, //禁止超车
  EndOfProhibitionOnOvertaking = 4, //解除禁止超车
  ChildrenAndSchoolZone = 5, //学校区域
  MinSpeedLimit = 6, //最小限速
  MaxSpeedLimit = 7, //最大限速
  EndOfSpeedLimit = 8, //限速结束
  NoEntrance = 9, //禁止驶入
  AllSpeedLimitCancel = 10, //取消所有限速
  NoParkingSign = 11, //禁止停车
  StartOfHighway = 12, //高速公路起点
  EndOfHighway = 13, //高速公路终点
  LeftCurve = 14, //向左急转弯路
  RightCurve = 15, //向右急转弯路
  SeriesCurves = 16, //连续弯路
  Others = 17, //其他
  Speed_limit_5 = 18,
  Speed_limit_10 = 19,
  Speed_limit_20 = 20,
  Speed_limit_25 = 110,
  Speed_limit_30 = 21,
  Speed_limit_40 = 22,
  Speed_limit_50 = 23,
  Speed_limit_60 = 24,
  Speed_limit_70 = 25,
  Speed_limit_80 = 26,
  Speed_limit_90 = 27,
  Speed_limit_100 = 28,
  Speed_limit_110 = 29,
  Speed_limit_120 = 30,
  End_speed_limit_5 = 31,
  End_speed_limit_10 = 32,
  End_speed_limit_15 = 111,
  End_speed_limit_20 = 33,
  End_speed_limit_25 = 112,
  End_speed_limit_30 = 34,
  End_speed_limit_40 = 35,
  End_speed_limit_50 = 36,
  End_speed_limit_60 = 37,
  End_speed_limit_70 = 38,
  End_speed_limit_80 = 39,
  End_speed_limit_90 = 40,
  End_speed_limit_100 = 41,
  End_speed_limit_110 = 42,
  End_speed_limit_120 = 43,
  Minimum_speed_limit_50 = 44,
  Minimum_speed_limit_60 = 45,
  Minimum_speed_limit_70 = 46,
  Minimum_speed_limit_80 = 47,
  Minimum_speed_limit_90 = 48,
  Minimum_speed_limit_100 = 49,
  Minimum_speed_limit_110 = 50,
  Overtake_restriction = 51,
  Ending_of_overtake_restriction = 52,
  Variable_speed_limit_10 = 53,
  Variable_speed_limit_20 = 54,
  Variable_speed_limit_30 = 55,
  Variable_speed_limit_40 = 56,
  Variable_speed_limit_50 = 57,
  Variable_speed_limit_60 = 58,
  Variable_speed_limit_70 = 59,
  Variable_speed_limit_80 = 60,
  Variable_speed_limit_90 = 61,
  Variable_speed_limit_100 = 62,
  Variable_speed_limit_110 = 63,
  Variable_speed_limit_120 = 64,
  Variable_sign_others = 65,
  Merge_Left = 66,
  Merge_right = 67,
  Attention_to_Pedestrians = 68,
  Attention_to_children = 69,
  Stop_sign = 70,
  Slow_down_and_give_way = 71,
  No_left_turn = 72,
  No_right_turn = 73,
  No_U_turn = 74,
  No_Audible_Warning = 75,
  Left_turn_sign = 76,
  Right_turn_sign = 77,
  pedestrian_crossing = 78,
  U_turn_Lane = 79,
  Number_of_lanes_becoming_less = 80,
  Lane_reducing = 81,
  Work_zone_sign = 82,
  Lane_changed = 83,
  Left_turn_lane = 84,
  Right_turn_lane = 85,
  Toll_gate = 86,
  Left_turn_and_forward_Lane = 87,
  Right_turn_and_forward_Lane = 88,
  Left_turn_and_U_turn_Lane = 89,
  Bus_lane = 90,
  Close_to_toll_gate = 91,
  School_ahead_low_down = 92,
  Ramp = 93,
  Military_control_zone = 94,
  Radio_observatory = 95,
  Traffic_sign_all = 96, //new add
  Speed_limit_15 = 97,
  Speed_limit_35 = 98,
  End_speed_limit_35 = 99,
  X_landr = 100,
  X_parking = 101,
  X_enter = 102,
  X_height = 103,
  X_weight = 104,
  X_entry = 105,
  X_straight = 106,
  // _skip_reserved_ = 107,
  X_width = 108,
  Straight_lane = 109
}
type TrafficSignalType = keyof typeof TrafficSignalEnum;

interface DataType {
  id: number;
  type: number; // 元素类型
  position: Vector3Like; // 模型中心位置
  rotation: Vector3Like; // 模型偏转值
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "trafficSignalModel";
}

const gltfLoader = new GLTFLoader();

export default abstract class TrafficSignal extends RenderObject {
  static cacheModels = {} as Record<TrafficSignalType, Object3D>;
  static modelFiles: Record<TrafficSignalType, string> = {
    OvertakingProhibited: OvertakingProhibited,
    EndOfProhibitionOnOvertaking: EndOfProhibitionOnOvertaking,
    X_landr: X_landr,
    X_parking: X_parking,
    X_entry: X_entry,
    X_enter: X_enter,
    X_straight: X_straight,
    Speed_limit_5: Speed_limit_5,
    Speed_limit_10: Speed_limit_10,
    Speed_limit_15: Speed_limit_15,
    Speed_limit_20: Speed_limit_20,
    Speed_limit_25: Speed_limit_25,
    Speed_limit_30: Speed_limit_30,
    Speed_limit_35: Speed_limit_35,
    Speed_limit_40: Speed_limit_40,
    Speed_limit_50: Speed_limit_50,
    Speed_limit_60: Speed_limit_60,
    Speed_limit_70: Speed_limit_70,
    Speed_limit_80: Speed_limit_80,
    Speed_limit_90: Speed_limit_90,
    Speed_limit_100: Speed_limit_100,
    Speed_limit_110: Speed_limit_110,
    Speed_limit_120: Speed_limit_120,
    End_speed_limit_5: End_speed_limit_5,
    End_speed_limit_10: End_speed_limit_10,
    End_speed_limit_15: End_speed_limit_15,
    End_speed_limit_20: End_speed_limit_20,
    End_speed_limit_25: End_speed_limit_25,
    End_speed_limit_30: End_speed_limit_30,
    End_speed_limit_35: End_speed_limit_35,
    End_speed_limit_40: End_speed_limit_40,
    End_speed_limit_50: End_speed_limit_50,
    End_speed_limit_60: End_speed_limit_60,
    End_speed_limit_70: End_speed_limit_70,
    End_speed_limit_80: End_speed_limit_80,
    End_speed_limit_90: End_speed_limit_90,
    End_speed_limit_100: End_speed_limit_100,
    End_speed_limit_110: End_speed_limit_110,
    End_speed_limit_120: End_speed_limit_120,
    Minimum_speed_limit_50: Minimum_speed_limit_50,
    Minimum_speed_limit_60: Minimum_speed_limit_60,
    Minimum_speed_limit_70: Minimum_speed_limit_70,
    Minimum_speed_limit_80: Minimum_speed_limit_80,
    Minimum_speed_limit_90: Minimum_speed_limit_90,
    Minimum_speed_limit_100: Minimum_speed_limit_100,
    Minimum_speed_limit_110: Minimum_speed_limit_110,
    Variable_sign_others: Variable_sign_others,
    Overtake_restriction: OvertakingProhibited,
    Ending_of_overtake_restriction: EndOfProhibitionOnOvertaking,
    Slow_down_and_give_way: Slow_down_and_give_way,
    Stop_sign: Stop_sign,
    No_left_turn: No_left_turn,
    No_right_turn: No_right_turn,
    No_U_turn: No_U_turn,
    No_Audible_Warning: No_Audible_Warning,
    Number_of_lanes_becoming_less: Number_of_lanes_becoming_less,
    Lane_changed: Lane_changed,
    Work_zone_sign: Work_zone_sign,
    X_height: X_height,
    X_width: X_width,
    X_weight: X_weight,
    Attention_to_children: Attention_to_children,
    Attention_to_Pedestrians: Attention_to_Pedestrians,
    Merge_right: Merge_right,
    Merge_Left: Merge_Left,
    pedestrian_crossing: pedestrian_crossing,
    Straight_lane: Straight_lane,
    U_turn_Lane: U_turn_Lane,
    Left_turn_lane: Left_turn_lane,
    Right_turn_lane: Right_turn_lane,
    Left_turn_and_forward_Lane: Left_turn_and_forward_Lane,
    Right_turn_and_forward_Lane: Right_turn_and_forward_Lane,
    Left_turn_and_U_turn_Lane: Left_turn_and_U_turn_Lane,
    Bus_lane: Bus_lane,
    Close_to_toll_gate: Close_to_toll_gate,
    Ramp: Ramp,

    Unknown: "",
    RoadWorks: "",
    Stop: "",
    ChildrenAndSchoolZone: "",
    MinSpeedLimit: "",
    MaxSpeedLimit: "",
    EndOfSpeedLimit: "",
    NoEntrance: "",
    AllSpeedLimitCancel: "",
    NoParkingSign: "",
    StartOfHighway: "",
    EndOfHighway: "",
    LeftCurve: "",
    RightCurve: "",
    SeriesCurves: "",
    Others: "",
    Variable_speed_limit_10: "",
    Variable_speed_limit_20: "",
    Variable_speed_limit_30: "",
    Variable_speed_limit_40: "",
    Variable_speed_limit_50: "",
    Variable_speed_limit_60: "",
    Variable_speed_limit_70: "",
    Variable_speed_limit_80: "",
    Variable_speed_limit_90: "",
    Variable_speed_limit_100: "",
    Variable_speed_limit_110: "",
    Variable_speed_limit_120: "",
    Left_turn_sign: "",
    Right_turn_sign: "",
    Lane_reducing: "",
    Toll_gate: "",
    School_ahead_low_down: "",
    Military_control_zone: "",
    Radio_observatory: "",
    Traffic_sign_all: ""
  };

  static preloading() {
    const proms = [];
    let key: keyof typeof TrafficSignal.modelFiles;
    for (key in TrafficSignal.modelFiles) {
      proms.push(TrafficSignal.initLoadModel(key));
    }
    return Promise.allSettled(proms);
  }

  static async initLoadModel(type: TrafficSignalType) {
    try {
      const modelFile = TrafficSignal.modelFiles[type];
      if (modelFile) {
        const gltf = await gltfLoader.loadAsync(modelFile);
        const model = gltf.scene;
        TrafficSignal.cacheModels[type] = model;
        return model;
      }
      return Promise.reject(`not find type: ${type}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createModel(modelData: DataType) {
    const { type } = modelData;
    const typeName = TrafficSignalEnum[type] as TrafficSignalType;

    if (TrafficSignal.cacheModels[typeName]) {
      const model = TrafficSignal.cacheModels[typeName].clone();
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
        if (model.userData.typeName !== TrafficSignalEnum[type]) {
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
