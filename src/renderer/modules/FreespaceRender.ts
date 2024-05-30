import * as THREE from "three";

import BasicTarget, { targetZIndex } from "../basic_target";

interface FreespaceData {
  id: number;
  contour: THREE.Vector2[];
  holes: THREE.Vector2[][];
  x?: number;
  y?: number;
  z: number;
  color: { r: number; g: number; b: number; a: number };
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export default class FreespaceRender extends BasicTarget {
  topic = ["pilothmi_lane_line"];

  update(data: FreespaceData[]): void {
    this.clear();
    if (!data.length) return;
    data.forEach((item) => {
      const {
        id,
        x = 0,
        y = 0,
        color,
        yaw = 0,
        pitch = 0,
        roll = 0,
        contour = [],
        holes = []
      } = item;
      if (contour.length < 3) return;
      const shape = new THREE.Shape();
      shape.moveTo(contour[0].x, contour[0].y);
      contour.forEach((point) => {
        shape.lineTo(point.x, point.y);
      });
      holes.forEach((hole) => {
        if (hole.length < 3) return;
        const holePath = new THREE.Path();
        holePath.moveTo(hole[0].x, hole[0].y);
        hole.forEach((point) => {
          holePath.lineTo(point.x, point.y);
        });
        shape.holes.push(holePath);
      });
      const shapeGeometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        color: new THREE.Color(color.r, color.g, color.b),
        opacity: color.a
      });
      const mesh = new THREE.Mesh(shapeGeometry, material);
      mesh.position.set(x, y, targetZIndex.frespace);
      mesh.rotation.set(
        roll * THREE.MathUtils.DEG2RAD,
        pitch * THREE.MathUtils.DEG2RAD,
        yaw * THREE.MathUtils.DEG2RAD
      );
      this.modelList[id] = mesh;
      this.scene.add(mesh);
    });
  }
}
