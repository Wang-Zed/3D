import {
  BufferAttribute,
  Color,
  DoubleSide,
  Mesh,
  Object3D,
  type RGB,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  type Vector3Like
} from "three";

import type { UpdateDataTool } from "@/typings";

import RenderObject from "../RenderObject";

interface DataType {
  color: RGB;
  id: number;
  position: Vector3Like; // 中心点坐标，z轴坐标将忽略
  rotation: Vector3Like; // 朝向角，通常来说只识别z轴的偏向角
  shape: Vector3Like[];

  type?: number; // 元素类型
  lane_ids?: number[];
}

export interface UpdateData extends UpdateDataTool<DataType[]> {
  type: "crosswalk";
}

export default abstract class Crosswalk extends RenderObject {
  createModel(modelData: DataType) {
    const { shape } = modelData;
    const points = shape.map((point) => new Vector2(point.x, point.y));
    const side1 = new Vector2().subVectors(points[0], points[1]);
    const side2 = new Vector2().subVectors(points[1], points[2]);
    const aspect = side1.length() / side2.length();
    let pnts = [...points]; // 使用解构赋值创建 pnts 数组的副本
    if (aspect > 1) {
      pnts = [...pnts.slice(1), pnts[0]]; // 将 pnts 数组向右旋转一位
    }

    const geometry = new ShapeGeometry(new Shape(pnts));
    // 动态计算条纹数量
    const stripes = aspect > 1 ? side1.length() : side2.length();

    const uvs = new Float32Array([0, 0, 1, 0, 1, stripes, 0, stripes]);
    geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
    const material = new ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
      
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 customColor; // 自定义颜色
      
        void main() {
          vec2 fUv = fract(vUv + vec2(0., 0.5)); // added vec2(0., 0.5)
          float strength = abs(fUv.y - 0.5);
          float blur = length(fwidth(vUv));
          strength = smoothstep(0.30 - blur, 0.30, strength);
          gl_FragColor = vec4(customColor, strength); // 使用自定义颜色和透明度
        }
      `,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        customColor: { value: new Color() } // 设置默认自定义颜色
      },
      depthWrite: false
    });
    const mesh = new Mesh(geometry, material);
    mesh.userData.shape = shape;
    mesh.renderOrder = this.renderOrder;

    return mesh;
  }

  setModelAttributes(model: Object3D, modelData: DataType) {
    const { position, rotation, color } = modelData;
    const mesh = model as Mesh<ShapeGeometry, ShaderMaterial>;
    mesh.position.set(position.x, position.y, 0);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.material.uniforms.customColor.value.set(color.r, color.g, color.b);
    mesh.visible = this.enable;
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
