import ShaderProgram from '../../ShaderProgram.js';
import Mat4Uniform from '../../../Uniforms/Mat4Uniform.js';
import Vec3Attribute from '../../../Attributes/Vec3Attribute.js';

import vertexCode from './vertex.js';
import fragmentCode from './fragment.js';
import Mesh from '../../../Mesh.js';

export default class ColoredShader2D extends ShaderProgram {
  position: Vec3Attribute;
  model: Mat4Uniform;
  projection: Mat4Uniform;

  constructor(gl: WebGLRenderingContext) {
    super(gl, vertexCode, fragmentCode);
    this.position = new Vec3Attribute(gl, this, 'position');
    this.model = new Mat4Uniform(gl, this, 'model').set();
    this.projection = new Mat4Uniform(gl, this, 'projection').set();
  }

  bindAttributes() {
    this.position.bind();
  }

  bind(mesh: Mesh) {
    mesh.bind(this.position);
  }
}
