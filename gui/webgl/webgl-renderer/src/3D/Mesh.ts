import Attribute from './Attributes/Attribute';

export default class Mesh {
  vertices: WebGLBuffer;
  indices: WebGLBuffer;
  uvs?: WebGLBuffer;

  indexCount: number;

  constructor(public gl: WebGLRenderingContext, vertices: number[], indices: number[], uvs?: number[]) {
    this.vertices = Mesh.createBuffer(gl, gl.ARRAY_BUFFER, vertices);
    this.indices = Mesh.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices);
    if (uvs !== undefined) {
      this.uvs = Mesh.createBuffer(gl, gl.ARRAY_BUFFER, uvs);
    }
    this.indexCount = indices.length;
  }

  release() {
    this.releaseVertices();
    this.releaseIndices();
    this.releaseUvs();
  }

  releaseVertices() {
    this.gl.deleteBuffer(this.vertices);
  }

  releaseIndices() {
    this.gl.deleteBuffer(this.indices);
  }

  releaseUvs() {
    if (this.uvs !== undefined) {
      this.gl.deleteBuffer(this.uvs);
    }
  }

  static createBuffer(gl: WebGLRenderingContext, type: number, data: number[]): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw new Error('Bad GL Context passed!');
    }
    gl.bindBuffer(type, buffer);
    gl.bufferData(
      type,
      type === gl.ARRAY_BUFFER ? new Float32Array(data) : new Uint16Array(data),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(type, null);
    return buffer;
  }

  bind(positionAttribute: Attribute, uvAttibute?: Attribute) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertices);
    positionAttribute.bind();
    if (uvAttibute !== undefined && this.uvs !== undefined) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvs);
      uvAttibute.bind();
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices);
  }

  // Creates simple indices for list of quad vertices -- array where each 4 vertices are for quads
  static generateQuadIndices(vertices: number[]) {
    const indices: number[] = [];
    const totalQuads = vertices.length / 4 / 3;
    for (let i = 0; i < totalQuads; i++) {
      const first = i * 4;
      indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
    }
    return indices;
  }

  static quad(gl: WebGLRenderingContext, uvs: number[] = Mesh.quadUVs): Mesh {
    return new Mesh(gl, Mesh.quadVertices, Mesh.generateQuadIndices(Mesh.quadVertices), uvs);
  }

  static worldTileUVSize = 1.0 / 16;

  static generateWorldVertices(): number[] {
    const vertices = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        vertices.push(x, y + 1, 0.0, x + 1, y + 1, 0.0, x + 1, y, 0.0, x, y, 0.0);
      }
    }
    return vertices;
  }
  static worldVertices = Mesh.generateWorldVertices();
  static worldIndices = Mesh.generateQuadIndices(Mesh.worldVertices);

  static addUVsForTile(array: number[], index: number) {
    const u = (index % 16) * Mesh.worldTileUVSize;
    const v = Math.floor(index / 16) * Mesh.worldTileUVSize;
    array.push(
      u,
      v + Mesh.worldTileUVSize,
      u + Mesh.worldTileUVSize,
      v + Mesh.worldTileUVSize,
      u + Mesh.worldTileUVSize,
      v,
      u,
      v
    );
  }

  static generateWorldMesh(gl: WebGLRenderingContext, data: number[][]): Mesh {
    const uvs: number[] = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        this.addUVsForTile(uvs, data[x][y]);
      }
    }
    return new Mesh(gl, Mesh.worldVertices, Mesh.worldIndices, uvs);
  }

  static quadVertices = [-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 0.0];

  static quadUVs = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0];
}
