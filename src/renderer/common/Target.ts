import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
  type RGB
} from "three";

import RenderObject from "@/renderer/RenderObject";
import type { UpdateDataTool } from "@/typings";

import Text from "./Text";

interface DataType {
  color: RGB;
  extra_info: string[];
  height: number;
  id: number;
  length: number;
  type: number;
  width: number;
  x: number;
  y: number;
  yaw: number; // 偏转角
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "target";
}

const boxMaterial = new MeshLambertMaterial();
const boxGeometry = new BoxGeometry(1, 1, 1);
const boxMesh = new Mesh(boxGeometry, boxMaterial);

const edgesMaterial = new LineBasicMaterial();
const edgesMesh = new LineSegments(
  new EdgesGeometry(boxGeometry),
  edgesMaterial
);

export default abstract class Target extends RenderObject {
  createModel(modelData: DataType) {
    const { color, type } = modelData;
    const group = new Group();
    const boxMeshMaterial = boxMaterial.clone();
    boxMeshMaterial.transparent = true;
    boxMeshMaterial.opacity = !type ? 0.8 : 0.15;
    boxMeshMaterial.color.setRGB(color.r, color.g, color.b);

    const boxMeshNew = boxMesh.clone();
    boxMeshNew.material = boxMeshMaterial;
    boxMeshNew.name = "box";

    const edgesMeshMaterial = edgesMaterial.clone();
    edgesMeshMaterial.color.setRGB(color.r, color.g, color.b);

    const edgesMeshNew = edgesMesh.clone();
    edgesMeshNew.material = edgesMeshMaterial;
    edgesMeshNew.name = "edges";

    const textMesh = createBoxText(modelData);
    textMesh.name = "text";

    group.add(boxMeshNew, edgesMeshNew, textMesh);
    group.renderOrder = this.renderOrder;
    return group;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { yaw, x, y, length, width, height, color } = modelData;
    const group = model as Group;
    group.rotation.z = yaw;
    group.position.set(x, y, height / 2);
    group.visible = this.enable;

    const boxMeshNew = group.getObjectByName("box");
    if (boxMeshNew instanceof Mesh) {
      boxMeshNew.scale.set(length, width, height);
      boxMeshNew.material.color.setRGB(color.r, color.g, color.b);
    }
    const edgesMeshNew = group.getObjectByName("edges");
    if (edgesMeshNew instanceof LineSegments) {
      edgesMeshNew.scale.set(length, width, height);
      edgesMeshNew.material.color.setRGB(color.r, color.g, color.b);
    }
    const textMeshNew = group.getObjectByName("text");
    if (textMeshNew instanceof Mesh) {
      textMeshNew.material.color.setRGB(color.r, color.g, color.b);
    }
  }

  update(data: UpdateData) {
    if (!data.data.length) {
      this.clear();
      return;
    }
    data.data.forEach((modelData) => {
      const { id } = modelData;
      const model = this.modelList.get(id);
      if (model) {
        this.setModelAttributes(model, modelData);
      } else {
        const newModel = this.createModel(modelData);
        this.setModelAttributes(newModel, modelData);
        this.scene.add(newModel);
        this.modelList.set(id, newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}

function createBoxText(data: DataType) {
  let text = String(data.id);
  let object_type = "";
  let hasCipv = false;
  // 优化后的遍历
  data.extra_info.some((info) => {
    const objectTypeValue = extractValue(info, "object_type");
    const cipvValue = extractValue(info, "cipv");

    if (objectTypeValue !== null) {
      object_type = objectTypeValue;
    }
    if (cipvValue !== null) {
      hasCipv = cipvValue.toLowerCase() === "true";
    }

    // 如果两个值都已找到，则终止循环
    return objectTypeValue !== null && cipvValue !== null;
  });
  if (object_type) {
    text += `-${object_type}`;
  }
  if (hasCipv) {
    text += "-CIPV";
  }

  const model = Text.createTextMesh(text, 0.5);
  model.material.color.setRGB(data.color.r, data.color.g, data.color.b);
  model.position.z = data.height / 2 + 0.4;
  model.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
  return model;
}

function extractValue(str: string, key: string) {
  const index = str.indexOf(key);
  if (index !== -1) {
    const valueStart = index + key.length + 1; // +1 to skip the colon (:) after the key
    const value = str.slice(valueStart).trim();
    return value;
  }
  return null; // Return null if the key is not found
}
