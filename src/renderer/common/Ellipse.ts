import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  type RGB,
  Shape,
  ShapeGeometry
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  ellipse: {
    x: number;
    y: number;
    z: number;
    radius_x: number;
    radius_y: number;
    start_angle: number;
  };
  color: RGB;
  opacity: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "ellipse";
}

const materialCache = new MeshBasicMaterial({ transparent: true });

export default abstract class Ellipse extends RenderObject {
  createModel(modelData: DataType) {
    const { x, y, radius_x, radius_y, start_angle } = modelData.ellipse;
    const shape = new Shape();
    shape.ellipse(x, y, radius_x, radius_y, 0, 2 * Math.PI, false, start_angle);
    const geometry = new ShapeGeometry(shape, 6);
    const material = materialCache.clone();
    material.color.setRGB(
      modelData.color.r,
      modelData.color.g,
      modelData.color.b
    );
    material.opacity = modelData.opacity;
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = this.renderOrder;
    return mesh;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { x, y, z } = modelData.ellipse;
    model.position.set(x, y, Math.max(z, 0));
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
