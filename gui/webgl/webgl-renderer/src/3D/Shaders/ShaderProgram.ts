import Mesh from '../Mesh.js';

export default abstract class ShaderProgram {
  ref: WebGLProgram;
  vertex: WebGLShader;
  fragment: WebGLShader;

  static currentShader?: ShaderProgram;
  currentMesh?: Mesh;

  constructor(public gl: WebGLRenderingContext, vertexShaderCode: string, fragmentShaderCode: string) {
    this.vertex = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(this.vertex, vertexShaderCode);
    gl.compileShader(this.vertex);
    this.fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(this.fragment, fragmentShaderCode);
    gl.compileShader(this.fragment);
    this.ref = gl.createProgram()!;
    gl.attachShader(this.ref, this.vertex);
    gl.attachShader(this.ref, this.fragment);
    gl.linkProgram(this.ref);
    gl.useProgram(this.ref);
  }

  use() {
    this.gl.useProgram(this.ref);
    ShaderProgram.currentShader = this;
  }

  abstract bind(mesh: Mesh): void;

  draw(mesh: Mesh) {
    if (ShaderProgram.currentShader !== this) {
      this.use();
    }
    if (this.currentMesh !== mesh) {
      this.bind(mesh);
      this.currentMesh = mesh;
    }
    this.gl.drawElements(this.gl.TRIANGLES, this.currentMesh!.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }

  drawDirect() {
    this.gl.drawElements(this.gl.TRIANGLES, this.currentMesh!.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }
}
