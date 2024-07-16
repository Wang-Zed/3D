import getNormals from "polyline-normals";
import { BufferAttribute, BufferGeometry } from "three";

type Point2 = [number, number];
type Point2WithColor = [number, number, number, number, number, number];

type LinePath = Array<Point2 | Point2WithColor>;

interface options {
  ratio?: boolean;
  distances?: boolean;
  closed?: boolean;
}

function getPtDist(
  pt1: Point2 | Point2WithColor,
  pt2: Point2 | Point2WithColor
) {
  return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}

function createBuildIndexArray(hasColor: boolean) {
  if (hasColor) {
    return function (this: Line, point: LinePath) {
      const path = point as Point2WithColor[];
      const normals = getNormals(path);

      const attrPosition = this.getAttribute("position") as BufferAttribute;
      const attrNormal = this.getAttribute("lineNormal") as BufferAttribute;
      const attrMiter = this.getAttribute("lineMiter") as BufferAttribute;
      const attrDistance = this.getAttribute("lineDistance") as BufferAttribute;
      const attrRatio = this.getAttribute("lineRatio") as BufferAttribute;
      const attrCustomColor = this.getAttribute(
        "customColor"
      ) as BufferAttribute;

      const attrIndex = this.getIndex() as BufferAttribute;

      let index = 0;
      let c = 0;
      let dIndex = 0;
      const indexArray = attrIndex.array;
      let cur_length = 0;

      path.forEach((point, pointIndex, list) => {
        const i = index;
        indexArray[c++] = i;
        indexArray[c++] = i + 1;
        indexArray[c++] = i + 2;
        indexArray[c++] = i + 2;
        indexArray[c++] = i + 1;
        indexArray[c++] = i + 3;

        attrCustomColor.setXYZW(index, point[2], point[3], point[4], point[5]);
        attrPosition.setXYZ(index++, point[0], point[1], 0);
        attrCustomColor.setXYZW(index, point[2], point[3], point[4], point[5]);
        attrPosition.setXYZ(index++, point[0], point[1], 0);

        if (attrRatio) {
          const d = pointIndex / (list.length - 1);
          attrRatio.setX(dIndex++, d);
          attrRatio.setX(dIndex++, d);
        }
        if (attrDistance) {
          let d = 0;
          if (pointIndex > 0) {
            d = getPtDist(point, list[pointIndex - 1]);
          }
          cur_length += d;
          attrDistance.setX(dIndex++, cur_length);
          attrDistance.setX(dIndex++, cur_length);
        }
      });

      let nIndex = 0;
      let mIndex = 0;
      normals.forEach((n) => {
        const norm = n[0];
        const miter = 1.0;
        attrNormal.setXY(nIndex++, norm[0], norm[1]);
        attrNormal.setXY(nIndex++, norm[0], norm[1]);

        attrMiter.setX(mIndex++, -miter);
        attrMiter.setX(mIndex++, miter);
      });
    };
  }
  return function (this: Line, point: LinePath) {
    const path = point as Point2[];
    const normals = getNormals(path);

    const attrPosition = this.getAttribute("position") as BufferAttribute;
    const attrNormal = this.getAttribute("lineNormal") as BufferAttribute;
    const attrMiter = this.getAttribute("lineMiter") as BufferAttribute;
    const attrDistance = this.getAttribute("lineDistance") as BufferAttribute;
    const attrRatio = this.getAttribute("lineRatio") as BufferAttribute;

    const attrIndex = this.getIndex() as BufferAttribute;

    let index = 0;
    let c = 0;
    let dIndex = 0;
    const indexArray = attrIndex.array;
    let cur_length = 0;

    path.forEach((point, pointIndex, list) => {
      const i = index;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 3;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 3;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 7;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 6;

      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);

      if (attrRatio) {
        const d = pointIndex / (list.length - 1);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
      }
      if (attrDistance) {
        let d = 0;
        if (pointIndex > 0) {
          d = getPtDist(point, list[pointIndex - 1]);
        }
        cur_length += d;
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
      }
    });

    let nIndex = 0;
    let mIndex = 0;
    normals.forEach((n, norm_index, norm_list) => {
      const norm = n[0];
      let norm_last = norm;
      if (norm_index > 0) {
        norm_last = norm_list[norm_index - 1][0];
      }
      const miter = 1.0;
      attrNormal.setXY(nIndex++, norm_last[0], norm_last[1]);
      attrNormal.setXY(nIndex++, norm_last[0], norm_last[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  };
}

export default class Line extends BufferGeometry {
  #hasColor: boolean;

  #VERTS_PER_POINT: number;

  #buildIndexArray: (path: LinePath) => void;

  constructor(path: LinePath, opt: options = {}) {
    super();

    this.#hasColor = path[0]?.length === 6;

    this.#VERTS_PER_POINT = this.#hasColor ? 2 : 4;
    this.#buildIndexArray = createBuildIndexArray(this.#hasColor);

    if (opt.closed) {
      path = path.slice();
      path.push(path[0]);
    }

    const indexCount = Math.max(
      0,
      (path.length - 1) * (this.#hasColor ? 6 : 12)
    );
    const count = path.length * this.#VERTS_PER_POINT;

    this.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(count * 3), 3)
    );
    this.setAttribute(
      "lineNormal",
      new BufferAttribute(new Float32Array(count * 2), 2)
    );
    this.setAttribute(
      "lineMiter",
      new BufferAttribute(new Float32Array(count), 1)
    );
    if (this.#hasColor) {
      this.setAttribute(
        "customColor",
        new BufferAttribute(new Float32Array(count * 4), 4)
      );
    }

    this.setIndex(new BufferAttribute(new Uint16Array(indexCount), 1));

    if (opt.ratio) {
      this.setAttribute(
        "lineRatio",
        new BufferAttribute(new Float32Array(count), 1)
      );
    }
    if (opt.distances) {
      this.setAttribute(
        "lineDistance",
        new BufferAttribute(new Float32Array(count), 1)
      );
    }
    this.update(path);
  }

  update(path: LinePath = []) {
    const attrPosition = this.getAttribute("position") as BufferAttribute;
    const attrNormal = this.getAttribute("lineNormal") as BufferAttribute;
    const attrMiter = this.getAttribute("lineMiter") as BufferAttribute;
    const attrDistance = this.getAttribute("lineDistance") as BufferAttribute;
    const attrRatio = this.getAttribute("lineRatio") as BufferAttribute;
    const attrCustomColor = this.getAttribute("customColor") as BufferAttribute;
    const attrIndex = this.getIndex() as BufferAttribute;

    const indexCount = Math.max(
      0,
      (path.length - 1) * (this.#hasColor ? 6 : 12)
    );
    const count = path.length * this.#VERTS_PER_POINT;

    if (
      !attrPosition.array ||
      path.length !== attrPosition.array.length / 3 / this.#VERTS_PER_POINT
    ) {
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      if (attrCustomColor) {
        attrCustomColor.array = new Float32Array(count * 4);
      }
      attrIndex.array = new Uint16Array(indexCount);

      if (attrRatio) {
        attrRatio.array = new Float32Array(count);
      }
      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    attrPosition.needsUpdate = true;

    attrNormal.needsUpdate = true;

    attrMiter.needsUpdate = true;

    attrIndex.needsUpdate = true;

    if (attrCustomColor) attrCustomColor.needsUpdate = true;

    if (attrRatio) attrRatio.needsUpdate = true;

    if (attrDistance) attrDistance.needsUpdate = true;

    this.#buildIndexArray(path);
  }
}
