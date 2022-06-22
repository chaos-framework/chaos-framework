import Mesh from './Mesh.js';

export default class Atlas {
  quads: Mesh[];

  constructor(gl: WebGLRenderingContext, size: number = 256) {
    const tilesPerRow = Math.sqrt(size);
    if (tilesPerRow % 1 !== 0) {
      throw new Error(
        `Atlas cannot be constructed with ${size} tiles since it does not have an integral square root.`
      );
    }
    this.quads = [];
    const uvSize = 1.0 / tilesPerRow;
    for (let y = 0; y < tilesPerRow; y++) {
      for (let x = 0; x < tilesPerRow; x++) {
        this.quads.push(Mesh.quad(gl, Atlas.generateUVs(x, y, uvSize)));
      }
    }
  }

  static generateUVs(x: number, y: number, tileSize: number) {
    const u = x * tileSize;
    const v = (y + 1) * tileSize;
    return [u, v - tileSize, u + tileSize, v - tileSize, u + tileSize, v, u, v];
  }
}
