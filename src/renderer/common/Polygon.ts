import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
  type RGB,
  ShapeUtils,
  type Vector2Like
} from "three";

import type { Point2, UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";
import Text from "./Text";

interface DataType {
  color: RGB;
  contour: Vector2Like[];
  height: number;
  id: number;
  show_id: boolean;
  type: number;
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "polygon";
}

const polygonMaterial = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.8
});

export default abstract class Polygon extends RenderObject {
  createModel(modelData: DataType) {
    const { id, contour, color, height, show_id } = modelData;
    const group = new Group();

    const geometry = createGeometry(contour, height);
    const material = polygonMaterial.clone();
    material.color.setRGB(color.r, color.g, color.b);
    const polygonMesh = new Mesh(geometry, material);
    polygonMesh.name = "polygon";
    group.add(polygonMesh);
    if (show_id) {
      const textMesh = Text.createTextMesh(String(id), 0.25);
      textMesh.name = "text";
      group.add(textMesh);
    }
    group.renderOrder = this.renderOrder;
    return group;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { contour, color, height, show_id } = modelData;
    const polygonMesh = model.getObjectByName("polygon");
    if (polygonMesh instanceof Mesh) {
      const geometry = createGeometry(contour, height);
      polygonMesh.geometry.dispose();
      polygonMesh.geometry = geometry;
      const material = polygonMesh.material;
      material.color.setRGB(color.r, color.g, color.b);
    }
    const textMesh = model.getObjectByName("text");
    if (show_id && textMesh instanceof Mesh) {
      const position = getPolygonPosition(contour);
      textMesh.position.set(position.x, position.y, height + 0.5);
      textMesh.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
      const textmaterial = textMesh.material;
      textmaterial.color.setRGB(color.r, color.g, color.b);
    } else if (textMesh instanceof Mesh) {
      textMesh.visible = false;
    }
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

const polygonOffsetZ = 0.1;

function createGeometry(contour: Point2[], height: number) {
  // 检查顶点顺序是否为顺时针，顺时针则需要倒置
  const isClockWise = ShapeUtils.isClockWise(contour);
  if (isClockWise) contour.reverse();

  // 初始化缓冲几何体以及类型化数组
  const geometry = new BufferGeometry();
  // 顶点坐标: 其中2 为上下面的顶点  3 为x/y/z三个坐标轴
  const vertices = new Float32Array(2 * 3 * contour.length);
  // 顶点法向量: 其中2 为上下面的顶点  3 为x/y/z三个坐标轴
  const normals = new Float32Array(2 * 3 * contour.length);
  // 索引值: 其中 3 * (n - 2) 为组成上顶面的三角形顶点数量
  // 索引值: 其中 6 * n 为组成侧面的三角形顶点数量
  const indexes = new Uint16Array(
    3 * (contour.length - 2) + 6 * contour.length
  );
  let verticesIndex = 0;
  let indexesIndex = 0;

  for (let i = 0; i < contour.length; i++) {
    // 设置组成上顶面的顶点坐标
    vertices[verticesIndex] = contour[i].x;
    vertices[verticesIndex + 1] = contour[i].y;
    vertices[verticesIndex + 2] = height + polygonOffsetZ;
    // 设置组成下顶面的顶点坐标
    vertices[verticesIndex + 3 * contour.length] = contour[i].x;
    vertices[verticesIndex + 1 + 3 * contour.length] = contour[i].y;
    vertices[verticesIndex + 2 + 3 * contour.length] = polygonOffsetZ;

    // 设置法向量,上顶面顶点统一朝Z正向, 下顶面顶点为(1,1,1),效果为渐变暗
    normals[verticesIndex] = 0;
    normals[verticesIndex + 1] = 0;
    normals[verticesIndex + 2] = 1;
    normals[verticesIndex + 3 * contour.length] = 1;
    normals[verticesIndex + 1 + 3 * contour.length] = 1;
    normals[verticesIndex + 2 + 3 * contour.length] = 0;

    verticesIndex += 3;

    // 设置索引值, 通过n - 2个三角形组成上顶面的多边形,n为边界点数量
    if (i >= 2) {
      indexes[indexesIndex] = 0;
      indexes[indexesIndex + 1] = i - 1;
      indexes[indexesIndex + 2] = i;
      indexesIndex += 3;
    }
  }

  for (let indexUp = 0; indexUp < contour.length; indexUp++) {
    const idnexBelow = indexUp + contour.length;
    if (idnexBelow + 1 === 2 * contour.length) {
      indexes[indexesIndex] = indexUp;
      indexes[indexesIndex + 1] = indexUp + 1;
      indexes[indexesIndex + 2] = 0;
      indexes[indexesIndex + 3] = idnexBelow;
      indexes[indexesIndex + 4] = indexUp + 1;
      indexes[indexesIndex + 5] = indexUp;
    } else {
      indexes[indexesIndex] = indexUp;
      indexes[indexesIndex + 1] = idnexBelow + 1;
      indexes[indexesIndex + 2] = indexUp + 1;
      indexes[indexesIndex + 3] = idnexBelow;
      indexes[indexesIndex + 4] = idnexBelow + 1;
      indexes[indexesIndex + 5] = indexUp;
    }
    indexesIndex += 6;
  }
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.index = new BufferAttribute(indexes, 1);

  // geometry.computeVertexNormals();

  return geometry;
}

function getPolygonPosition(contour: Point2[]) {
  let positionX = 0,
    positionY = 0;

  contour.forEach((item) => {
    positionX += item.x;
    positionY += item.y;
  });

  return {
    x: positionX / contour.length,
    y: positionY / contour.length
  };
}
