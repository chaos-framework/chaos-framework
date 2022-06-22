import ShaderProgram from '../Shaders/ShaderProgram.js';
import Texture from '../Texture.js';
import Uniform from './Uniform.js';

export default class Sampler extends Uniform {
  constructor(gl: WebGLRenderingContext, program: ShaderProgram, name: string) {
    super(gl, program, name);
  }

  bind(unit: number) {
    this.gl.uniform1i(this.location, 0);
  }
}
