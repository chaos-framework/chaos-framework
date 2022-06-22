import ShaderProgram from '../Shaders/ShaderProgram.js';

export default abstract class Uniform {
  location: WebGLUniformLocation;

  constructor(public gl: WebGLRenderingContext, public program: ShaderProgram, public name: string) {
    const location = gl.getUniformLocation(program.ref, name);
    if (location === null) {
      throw new Error(`Uniform for shader program with name ${name} could not be found.`);
    }
    this.location = location;
  }
}
