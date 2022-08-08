import { Vector } from '@chaos-framework/core';
import { vec2 } from 'gl-matrix';

import ShaderProgram from '../Shaders/ShaderProgram.js';
import Uniform from './Uniform.js';

export default class Vec2Uniform extends Uniform {
  constructor(
    gl: WebGLRenderingContext,
    program: ShaderProgram,
    name: string,
    public value: vec2 = vec2.create()
  ) {
    super(gl, program, name);
  }

  reset(): Vec2Uniform {
    this.value = vec2.zero(this.value);
    return this;
  }

  copy(): vec2 {
    return vec2.clone(this.value);
  }

  setX(x: number): Vec2Uniform {
    this.value[0] = x;
    return this;
  }

  setY(y: number): Vec2Uniform {
    this.value[1] = y;
    return this;
  }

  set(): Vec2Uniform {
    this.gl.uniform2f(this.location, this.value[0], this.value[1]);
    return this;
  }
}
