import Attribute from './Attribute.js';

export default class Vec2Attribute extends Attribute {
  bind(): void {
    this.gl.enableVertexAttribArray(this.index);
    this.gl.vertexAttribPointer(this.index, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.index);
  }
}
