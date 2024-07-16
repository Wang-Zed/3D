import { Color, Group, Mesh, Object3D, type RGB, ShaderMaterial } from "three";

import type { UpdateDataTool } from "@/typings";
import Line2D from "@/utils/three/objects/Line";
import {
  CustomizedShader,
  DashedShader,
  DoubleShader,
  SolidShader
} from "@/utils/three/objects/Line/shader";

import RenderObject from "../RenderObject";

interface DataType {
  color: RGB;
  lineType: number;
  width: number;
}

interface PointData {
  color: { r: number; g: number; b: number; a: number };
  colorEnable: boolean;
  x: number;
  y: number;
}

interface JSONDataType extends DataType {
  polyline: PointData[];
}

interface BufferDataType extends DataType {
  point: PointData[];
}

export interface UpdateData
  extends UpdateDataTool<(JSONDataType | BufferDataType)[]> {
  type: "polyline";
}

export default abstract class Polyline extends RenderObject {
  createModel(modelData: DataType) {
    const group = new Group();
    let point: PointData[] = [];
    if ("polyline" in modelData) {
      point = modelData.polyline as PointData[];
    } else if ("point" in modelData) {
      point = modelData.point as PointData[];
    }
    if (!point.length) return;
    let draw_solid_line = true;
    let draw_gradient_line = true;
    switch (modelData.lineType) {
      case 0:
        draw_solid_line = true;
        draw_gradient_line = true;
        break;
      case 1:
        draw_solid_line = true;
        draw_gradient_line = false;
        break;
      case 2:
        draw_solid_line = false;
        draw_gradient_line = true;
        break;
      default:
        draw_solid_line = true;
        draw_gradient_line = false;
        break;
    }
    if (draw_gradient_line) {
      const geometry = new Line2D(
        point.map((line) => [
          line.x,
          line.y,
          line.color.r,
          line.color.g,
          line.color.b,
          line.color.a
        ]),
        { distances: false, closed: false, ratio: true }
      );
      const material = CustomizedShader({
        thickness: modelData.width
      });
      const mesh = new Mesh(geometry, material);
      mesh.renderOrder = 1;
      group.add(mesh);
    }
    if (draw_solid_line) {
      const line_style = getPolylineStyle(
        modelData.lineType,
        modelData.color,
        modelData.width
      );
      const geometry = new Line2D(
        point.map((line) => [line.x, line.y]),
        {
          distances: line_style.distance,
          closed: false
        }
      );
      const mesh = new Mesh(geometry, line_style.mat);
      group.add(mesh);
    }
    group.renderOrder = this.renderOrder;
    return group;
  }

  setModelAttributes(model: Object3D) {
    model.visible = this.enable;
  }

  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const newModel = this.createModel(modelData);
      if (newModel) {
        this.setModelAttributes(newModel);
        this.modelList.set(newModel.uuid, newModel);
        this.scene.add(newModel);
      }
    });
  }
}

type ColorType = {
  r: number;
  g: number;
  b: number;
};

// 0:上渐变色下单色双实线(上下双层线) ,1: 单色实线 ,2: 渐变色实线 ,3: 单色虚线, 4: 单色实线,5: 双虚线,6: 双实线,7: 左虚右实线, 8:左实右虚线
function getPolylineStyle(type: number, color: ColorType, width: number) {
  const style: { mat: ShaderMaterial; distance: boolean } = {
    mat: new ShaderMaterial(),
    distance: false
  };

  // 默认均为实线
  let left_dash = 1,
    right_dash = 1;
  const default_color = new Color(color.r, color.g, color.b);
  if (type === 5 || type === 7) {
    left_dash = 0; // 左线为虚线
  }

  if (type === 5 || type === 8) {
    right_dash = 0; // 右线为虚线
  }

  switch (type) {
    case 0:
    case 1:
    case 4:
      style.mat = SolidShader({
        diffuse: default_color,
        thickness: width,
        opacity: 0.8
      });
      style.distance = false;
      break;
    case 3:
      style.mat = DashedShader({
        diffuse: default_color,
        thickness: width,
        opacity: 0.8
      });
      style.distance = true;
      break;
    case 5:
    case 6:
    case 7:
    case 8:
    default:
      style.mat = DoubleShader({
        diffuse: default_color,
        thickness: width,
        leftDashed: left_dash,
        rightDashed: right_dash,
        opacity: 0.8
      });
      style.distance = true;
  }
  return style;
}
