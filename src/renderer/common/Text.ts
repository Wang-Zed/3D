import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  type Vector2Like
} from "three";
import fontJSON from "three/examples/fonts/helvetiker_regular.typeface.json";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  fontSize: number;
  id: number;
  position: Vector2Like;
  text: string;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "text_sprite";
}

// @ts-ignore
const font = new FontLoader().parse(fontJSON);

const textMaterial = new MeshBasicMaterial({
  color: "#cccccc",
  side: DoubleSide,
  depthWrite: false
});

export default abstract class Text extends RenderObject {
  static textMeshCache = new Map<
    string,
    Mesh<TextGeometry, MeshBasicMaterial>
  >();
  static createTextMesh(text: string, fontSize: number) {
    if (Text.textMeshCache.size > 200) {
      Text.textMeshCache.delete(Array.from(Text.textMeshCache.keys())[0]);
    }
    const cacheKey = `${text}-${fontSize}`;
    if (Text.textMeshCache.has(cacheKey)) {
      return Text.textMeshCache.get(cacheKey)!.clone();
    }
    const geometry = new TextGeometry(text, {
      font: font,
      size: fontSize,
      depth: 0
    });
    geometry.center();
    const material = textMaterial.clone();
    const model = new Mesh(geometry, material);
    Text.textMeshCache.set(cacheKey, model);
    return model;
  }

  createModel(modelData: DataType) {
    const { fontSize, text } = modelData;
    const model = Text.createTextMesh(text, fontSize * 2);
    model.renderOrder = this.renderOrder;
    model.rotation.z = -Math.PI / 2;
    return model;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, fontSize } = modelData;
    model.position.set(position.x, position.y, 0);
    model.scale.setScalar(fontSize);
    model.visible = this.enable;
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
