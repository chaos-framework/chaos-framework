import Attribute from './Attribute.js';

export default class Vec3Attribute extends Attribute {
  bind(): void {
    this.gl.enableVertexAttribArray(this.index);
    this.gl.vertexAttribPointer(this.index, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.index);
  }
}
