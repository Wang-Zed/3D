import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  type RGB,
  SphereGeometry,
  type Vector3Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  center: Vector3Like;
  color: RGB;
  radius: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "sphere";
}

const geometryCache = new SphereGeometry(1, 16, 16);

const materialCache = new MeshBasicMaterial();

export default abstract class Sphere extends RenderObject {
  createModel() {
    const model = new Mesh(geometryCache.clone(), materialCache.clone());
    model.renderOrder = this.renderOrder;
    return model;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { color, center, radius } = modelData;
    const mesh = model as Mesh<SphereGeometry, MeshBasicMaterial>;
    mesh.position.copy(center);
    mesh.material.color.setRGB(color.r, color.g, color.b);
    mesh.scale.setScalar(radius);
  }

  update(data: UpdateData): void {
    this.clear();
    if (!data.data.length) return;
    data.data.forEach((modelData) => {
      const newModel = this.createModel();
      this.setModelAttributes(newModel, modelData);
      this.modelList.set(newModel.uuid, newModel);
      this.scene.add(newModel);
    });
  }
}
