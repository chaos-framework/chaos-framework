import ShaderProgram from '../Shaders/ShaderProgram.js';

export default abstract class Attribute {
  index: number;

  constructor(public gl: WebGLRenderingContext, public program: ShaderProgram, public name: string) {
    this.index = gl.getAttribLocation(program.ref, name);
    if (this.index === -1) {
      throw new Error(`Attribute for shader program with name ${name} could not be found.`);
    }
    this.bind();
  }

  abstract bind(): void;
}
