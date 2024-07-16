import {
  ArrowHelper,
  Color,
  Object3D,
  type RGB,
  Vector3,
  type Vector3Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataTypeBase {
  color: RGB;
  origin: Vector3Like;
}

interface DateType1 extends DataTypeBase {
  end_point: Vector3Like;
}

interface DateType2 extends DataTypeBase {
  endPoint: Vector3Like;
}

type DataType = DateType1 | DateType2;

export interface UpdateData extends UpdateDataTool<(DateType1 | DateType2)[]> {
  type: "arrow";
}

export default abstract class Arrow extends RenderObject {
  createModel(modelData: DataType) {
    const { origin: o, color: c } = modelData;
    let end_point: Vector3Like;
    if ("end_point" in modelData) {
      end_point = modelData.end_point;
    } else {
      end_point = modelData.endPoint;
    }
    const origin = new Vector3().copy(o);
    const end = new Vector3().copy(end_point);
    // 计算方向向量
    const sub = new Vector3().subVectors(end, origin);
    const length = sub.length();
    const dir = sub.normalize();
    const color = new Color(c.r, c.g, c.b);
    const arrow = new ArrowHelper(dir, origin, length, color);
    arrow.renderOrder = this.renderOrder;
    return arrow;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { origin, color } = modelData;
    const arrow = model as ArrowHelper;
    arrow.position.set(origin.x, origin.y, origin.z);
    arrow.setColor(new Color(color.r, color.g, color.b));
    arrow.visible = this.enable;
  }

  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const newModel = this.createModel(modelData);
      this.setModelAttributes(newModel, modelData);
      this.modelList.set(newModel.uuid, newModel);
      this.scene.add(newModel);
    });
  }
}
