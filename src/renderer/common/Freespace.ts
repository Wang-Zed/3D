import {
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Path,
  Shape,
  ShapeGeometry,
  type Vector2Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  color: { r: number; g: number; b: number; a: number };
  contour: Vector2Like[];
  holes: Vector2Like[][];
  z: number;

  id?: number;
  x?: number;
  y?: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "freespace";
}

const ShapeCache = new Shape();
const PathCache = new Path();

const materialCache = new MeshBasicMaterial({
  side: DoubleSide,
  transparent: true,
  depthWrite: false
});

export default abstract class Freespace extends RenderObject {
  createModel(modelData: DataType) {
    const { contour = [], holes = [] } = modelData;
    if (contour.length < 3) return;
    const shape = ShapeCache.clone();
    shape.moveTo(contour[0].x, contour[0].y);
    contour.forEach((point) => {
      shape.lineTo(point.x, point.y);
    });
    holes.forEach((hole) => {
      if (hole.length < 3) return;
      const holePath = PathCache.clone();
      holePath.moveTo(hole[0].x, hole[0].y);
      hole.forEach((point) => {
        holePath.lineTo(point.x, point.y);
      });
      shape.holes.push(holePath);
    });
    const mesh = new Mesh(new ShapeGeometry(shape), materialCache.clone());
    mesh.renderOrder = this.renderOrder;
    return mesh;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { x = 0, y = 0, yaw = 0, pitch = 0, roll = 0, color } = modelData;
    const mesh = model as Mesh<ShapeGeometry, MeshBasicMaterial>;
    mesh.material.color.set(color.r, color.g, color.b);
    mesh.material.opacity = color.a;
    mesh.position.set(x, y, 0);
    mesh.rotation.set(
      roll * MathUtils.DEG2RAD,
      pitch * MathUtils.DEG2RAD,
      yaw * MathUtils.DEG2RAD
    );
    mesh.visible = this.enable;
  }

  update(data: UpdateData) {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const newModel = this.createModel(modelData);
      if (newModel) {
        this.setModelAttributes(newModel, modelData);
        this.modelList.set(newModel.uuid, newModel);
        this.scene.add(newModel);
      }
    });
  }
}
