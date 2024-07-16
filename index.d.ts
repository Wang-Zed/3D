/// <reference types="vite/client" />

interface Memory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Window {
  performance: Performance & {
    memory?: Memory;
  };
}

declare const __COMMITID__: string;
declare const __BUILDTIME__: string;

declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const componentOptions: ComponentOptions;
  export default componentOptions;
}

declare module "*.gltf" {
  const value: string;
  export default value;
}

// polyline-normals.d.ts
declare module "polyline-normals" {
  /**
   * 计算折线的法线。
   * @param points 组成折线的点数组
   * @param closed 一个布尔值，指示折线是否闭合
   * @returns 返回法线数组
   */
  export default function getNormals(
    points: number[][],
    closed?: boolean
  ): [number[], number][];
}
