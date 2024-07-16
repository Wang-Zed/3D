import {
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  Shape,
  type Vector3Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

const fixedPolygonTypes = ["LeftArrow", "RightArrow", "Cube"] as const;

type fixedPolygonType = (typeof fixedPolygonTypes)[number];

interface DataType {
  id: number;
  type: number;
  status: number;
  position: Vector3Like;
  rotation: Vector3Like;
  scale: Vector3Like;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "fixedPolygon";
}

const colorList = ["#dddddd", "#ffff00", "#ff0000"];

const material = new MeshBasicMaterial({ color: "#ffffff" });

const leftShape = new Shape();
leftShape.moveTo(0, 0);
leftShape.lineTo(0.3, -1);
leftShape.lineTo(0.3, 0.4);
leftShape.lineTo(0.5, 0.4);
leftShape.lineTo(0, 1);
leftShape.lineTo(-0.5, 0.4);
leftShape.lineTo(-0.3, 0.4);
leftShape.lineTo(-0.3, -1);
leftShape.lineTo(0.3, -1);
const extrudeSettings = {
  steps: 2,
  depth: 0.2,
  bevelEnabled: false,
  bevelThickness: 1,
  bevelSize: 1,
  bevelOffset: 0,
  bevelSegments: 1
};
const geometry = new ExtrudeGeometry(leftShape, extrudeSettings);
geometry.center();

export default abstract class FixedPolygon extends RenderObject {
  static cacheModels = {} as Record<fixedPolygonType, Mesh>;

  createModel(modelData: DataType) {
    const { type } = modelData;
    const fixedPolygonItem = fixedPolygonTypes[type];
    if (FixedPolygon.cacheModels[fixedPolygonItem]) {
      const model = FixedPolygon.cacheModels[fixedPolygonTypes[type]].clone();
      model.renderOrder = this.renderOrder;
      return model;
    }
    let mesh: Mesh;
    if (fixedPolygonItem === "LeftArrow") {
      mesh = new Mesh(geometry.clone(), material.clone());
    } else if (fixedPolygonItem === "RightArrow") {
      mesh = new Mesh(geometry.clone(), material.clone());
      mesh.rotation.z = Math.PI;
    } else {
      const cubeGeometry = new BoxGeometry(0.6, 0.6, 0.6);
      mesh = new Mesh(cubeGeometry, material.clone());
    }
    mesh.renderOrder = this.renderOrder;
    FixedPolygon.cacheModels[fixedPolygonItem] = mesh;
    return mesh;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { type, status, position, rotation, scale } = modelData;
    const mesh = model as Mesh<BufferGeometry, MeshBasicMaterial>;
    mesh.position.copy(position);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    if (fixedPolygonTypes[type] === "RightArrow") {
      mesh.rotation.z += Math.PI;
    }
    mesh.scale.copy(scale);
    mesh.material.color.set(colorList[status]);
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
        this.modelList.set(id, newModel);
        this.scene.add(newModel);
      }
    });
    this.checkModelByData(data.data);
  }
}
