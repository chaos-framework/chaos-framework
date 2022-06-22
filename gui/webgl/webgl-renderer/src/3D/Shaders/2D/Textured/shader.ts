import ShaderProgram from '../../ShaderProgram.js';
import Mat4Uniform from '../../../Uniforms/Mat4Uniform.js';
import Vec3Attribute from '../../../Attributes/Vec3Attribute.js';

import vertexCode from './vertex.js';
import fragmentCode from './fragment.js';
import Vec2Attribute from '../../../Attributes/Vec2Attribute.js';
import Texture from '../../../Texture.js';
import Sampler from '../../../Uniforms/Sampler.js';
import Mesh from '../../../Mesh.js';

export default class TexturedShader2D extends ShaderProgram {
  position: Vec3Attribute;
  uv: Vec2Attribute;
  model: Mat4Uniform;
  projection: Mat4Uniform;
  sampler: Sampler;

  boundTexture?: Texture;

  constructor(gl: WebGLRenderingContext) {
    super(gl, vertexCode, fragmentCode);
    this.position = new Vec3Attribute(gl, this, 'position');
    this.uv = new Vec2Attribute(gl, this, 'uv');
    this.model = new Mat4Uniform(gl, this, 'model').set();
    this.projection = new Mat4Uniform(gl, this, 'projection').set();
    this.sampler = new Sampler(gl, this, 'sampler');
  }

  bind(mesh: Mesh) {
    mesh.bind(this.position, this.uv);
  }

  bindTexture(texture: Texture) {
    if (this.boundTexture !== texture) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      texture.bind();
      this.boundTexture = texture;
    }
  }
}
