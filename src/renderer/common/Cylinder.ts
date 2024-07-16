import {
  CylinderGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  type RGB,
  type Vector3Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  center: Vector3Like;
  color: RGB;
  height: number;
  radius_bottom: number;
  radius_top: number;
  rotation: Vector3Like;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "cylinder";
}

const meshMaterialCache = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.8
});
const LineMaterialCache = new LineBasicMaterial();

export default abstract class Cylinder extends RenderObject {
  createModel(modelData: DataType) {
    const { radius_top, radius_bottom, height } = modelData;

    const group = new Group();

    const geometry = new CylinderGeometry(radius_top, radius_bottom, height, 8);
    const cylinderMesh = new Mesh(geometry, meshMaterialCache.clone());
    cylinderMesh.name = "cylinder";

    const edges = new EdgesGeometry(geometry);
    const edgesMaterial = LineMaterialCache.clone();
    const edgesMesh = new LineSegments(edges, edgesMaterial);
    edgesMesh.name = "edges";

    group.add(cylinderMesh, edgesMesh);
    group.renderOrder = this.renderOrder;
    return group;
  }

  setModelAttributes(model: Group, modelData: DataType) {
    const { color, center, rotation } = modelData;
    const cylinderMesh = model.getObjectByName("cylinder") as Mesh<
      CylinderGeometry,
      MeshBasicMaterial
    >;
    cylinderMesh.material.color.setRGB(color.r, color.g, color.b);

    const edgesMesh = model.getObjectByName("edges") as LineSegments<
      EdgesGeometry,
      LineBasicMaterial
    >;
    edgesMesh.material.color.setRGB(color.r, color.g, color.b);

    model.position.copy(center);
    model.rotation.set(
      rotation.x * MathUtils.DEG2RAD,
      rotation.y * MathUtils.DEG2RAD,
      rotation.z * MathUtils.DEG2RAD
    );
  }

  update(data: UpdateData): void {
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
