import { mat4, vec3 } from 'gl-matrix';

import ShaderProgram from '../Shaders/ShaderProgram.js';
import Uniform from './Uniform.js';

export default class Mat4Uniform extends Uniform {
  constructor(
    gl: WebGLRenderingContext,
    program: ShaderProgram,
    name: string,
    public value: mat4 = mat4.create()
  ) {
    super(gl, program, name);
  }

  reset(): Mat4Uniform {
    this.value = mat4.identity(this.value);
    return this;
  }

  copy(): mat4 {
    return mat4.clone(this.value);
  }

  translate(x: number, y: number, z: number = 0): Mat4Uniform {
    mat4.translate(this.value, this.value, [x, y, z]);
    return this;
  }

  translateToTile(x: number, y: number, z: number = 0): Mat4Uniform {
    mat4.translate(this.value, this.value, [x + 0.5, y + 0.5, z]);
    return this;
  }

  rotate2D(amount: number): Mat4Uniform {
    mat4.rotateZ(this.value, this.value, amount * (Math.PI / 180));
    return this;
  }

  rotate(x: number, y: number, z: number = 0): Mat4Uniform {
    mat4.rotateX(this.value, this.value, x * (Math.PI / 180));
    mat4.rotateY(this.value, this.value, y * (Math.PI / 180));
    mat4.rotateZ(this.value, this.value, z * (Math.PI / 180));
    return this;
  }

  scale(x: number, y: number): Mat4Uniform {
    mat4.scale(this.value, this.value, [x, y, 1.0]);
    return this;
  }

  lookAt(eye: vec3, at: vec3, up: vec3 = [0, 1, 0]): Mat4Uniform {
    mat4.targetTo(this.value, eye, at, up);
    return this;
  }

  orthographic(x: number, y: number, width: number, height: number, invertY: boolean = false): Mat4Uniform {
    this.setOrthographic(x, x + width, y, y + height, -10, 10);
    return this;
  }

  private setOrthographic(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ) {
    var M = mat4.create();

    // Make sure there is no division by zero
    if (left === right || bottom === top || near === far) {
      console.log('Invalid createOrthographic parameters');
      return;
    }

    var widthRatio = 1.0 / (right - left);
    var heightRatio = 1.0 / (top - bottom);
    var depthRatio = 1.0 / (far - near);

    var sx = 2 * widthRatio;
    var sy = 2 * heightRatio;
    var sz = -2 * depthRatio;

    var tx = -(right + left) * widthRatio;
    var ty = -(top + bottom) * heightRatio;
    var tz = -(far + near) * depthRatio;

    M[0] = sx;
    M[4] = 0;
    M[8] = 0;
    M[12] = tx;
    M[1] = 0;
    M[5] = sy;
    M[9] = 0;
    M[13] = ty;
    M[2] = 0;
    M[6] = 0;
    M[10] = sz;
    M[14] = tz;
    M[3] = 0;
    M[7] = 0;
    M[11] = 0;
    M[15] = 1;

    this.value = M;
  }

  set(): Mat4Uniform {
    this.gl.uniformMatrix4fv(this.location, false, this.value);
    return this;
  }
}
