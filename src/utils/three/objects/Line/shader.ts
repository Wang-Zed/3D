import { BackSide, Color, ShaderMaterial, UniformsUtils } from "three";

function asNumber(num?: number, defaultNum?: number) {
  return typeof num === "number"
    ? num
    : typeof defaultNum === "number"
      ? defaultNum
      : 0;
}

// 用于画单色实线
export const SolidShader = (option: {
  diffuse: Color;
  thickness?: number;
  opacity?: number;
}) =>
  new ShaderMaterial({
    side: BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: UniformsUtils.clone({
      thickness: { value: asNumber(option.thickness, 0.1) },
      opacity: { value: asNumber(option.opacity, 1.0) },
      diffuse: { value: option.diffuse || new Color(0xffffff) }
    }),
    vertexShader: `
      uniform float thickness;
      attribute float lineMiter;
      attribute vec2 lineNormal;

      void main() { 
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 diffuse;
      uniform float opacity;
      void main() {
        gl_FragColor = vec4(diffuse, opacity);
      }
    `
  });

// 用于画单色虚线
export const DashedShader = (option: {
  diffuse: Color;
  thickness?: number;
  opacity?: number;
  dashSteps?: number;
  dashDistance?: number;
}) =>
  new ShaderMaterial({
    side: BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: UniformsUtils.clone({
      thickness: { value: asNumber(option.thickness, 0.1) },
      opacity: { value: asNumber(option.opacity, 1.0) },
      diffuse: { value: option.diffuse || new Color(0xffffff) },
      dashSteps: { value: asNumber(option.dashSteps, 4) },
      dashDistance: { value: asNumber(option.dashDistance, 2) }
    }),
    vertexShader: `
      uniform float thickness;
      attribute float lineMiter;
      attribute vec2 lineNormal;
      attribute float lineDistance;
      varying float lineU;

      void main() { 
        lineU = lineDistance;
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
      }
    `,
    fragmentShader: `
      varying float lineU;

      uniform vec3 diffuse;
      uniform float opacity;
      uniform float dashSteps;
      uniform float dashSmooth;
      uniform float dashDistance;

      void main() {
        float lineUMod = mod(lineU, dashSteps + dashDistance);
        float dash = 1.0 - step(dashDistance, lineUMod);
        gl_FragColor = vec4(diffuse * vec3(dash), opacity * dash);
      }
    `
  });

// 用于画纯色双线
export const DoubleShader = (option: {
  diffuse?: Color;
  thickness?: number;
  leftDashed?: number;
  rightDashed?: number;
  opacity?: number;
  dashSteps?: number;
  dashDistance?: number;
}) =>
  new ShaderMaterial({
    side: BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: UniformsUtils.clone({
      thickness: { value: asNumber(option.thickness, 0.3) },
      opacity: { value: asNumber(option.opacity, 1.0) },
      diffuse: { value: option.diffuse || new Color(0xffffff) },
      dashSteps: { value: asNumber(option.dashSteps, 3) },
      dashDistance: { value: asNumber(option.dashDistance, 2) },
      leftDashed: { value: asNumber(option.leftDashed, 0) },
      rightDashed: { value: asNumber(option.rightDashed, 0) }
    }),
    vertexShader: `
      uniform float thickness;
      attribute float lineMiter;
      attribute vec2 lineNormal;
      attribute float lineDistance;
      varying float lineU;
      varying float lineV;

      void main() { 
        lineV = sign(lineMiter);
        lineU = lineDistance;
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
      }
    `,
    fragmentShader: `
      varying float lineV;
      varying float lineU;

      uniform vec3 diffuse;
      uniform float opacity;
      uniform float dashSteps;
      uniform float dashSmooth;
      uniform float dashDistance;
      uniform float leftDashed;
      uniform float rightDashed;

      void main() {
        float lineUMod = mod(lineU, dashSteps + dashDistance);
        float dash = 1.0 - step(dashDistance, lineUMod);
        float gap_ratio = step(0.33, abs(lineV));
        float center_mask = step(0.0, lineV);
        float side_mask = center_mask * leftDashed + (1.0 - center_mask) * rightDashed ;
        float final_dash = min(dash + side_mask, 1.0) * gap_ratio;
        gl_FragColor = vec4(diffuse * vec3(final_dash), opacity * final_dash);
      }
    `
  });

// 自定义着色器材质, 目前用于画渐变实线
export const CustomizedShader = (option: { thickness?: number } = {}) =>
  new ShaderMaterial({
    uniforms: UniformsUtils.clone({
      thickness: { value: asNumber(option.thickness, 0.1) }
    }),
    side: BackSide,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform float thickness;
      attribute float lineMiter;
      attribute vec2 lineNormal;
      attribute float lineRatio;
      attribute vec4 customColor;
      varying vec4 vColor;

      void main() { 
        vColor = vec4(customColor.r, customColor.g, customColor.b, customColor.a);
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec4 vColor;

      void main() {
        gl_FragColor = vec4(vColor.xyz, vColor.a);
      }
    `
  });
