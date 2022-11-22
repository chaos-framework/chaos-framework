import { Vector, World } from '@chaos-framework/core';
import { runInThisContext } from 'vm';
import Mat4Uniform from './3D/Uniforms/Mat4Uniform.js';

interface OrthographicBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  near: number;
  far: number;
}

export default class Camera {
  chunksInView = new Map<string, Vector>();
  oldChunks = new Array<Vector>();
  newChunks = new Array<Vector>();
  modified: boolean = false;

  bounds?: [Vector, Vector];

  world?: World;

  constructor(
    public center: Vector = new Vector(0, 0),
    public zoom: number = 16,
    public viewport: Vector = new Vector(640, 480)
  ) {
    // Keep within reasonable constraints
    this.clampCenter();
    this.clampZoom();
  }

  pan(amount: { x: number; y: number }) {
    this.center.x += amount.x;
    this.center.y += amount.y;
    this.clampCenter();
    this.modified = true;
  }

  panTo(to: { x: number; y: number }) {
    this.center.x = to.x;
    this.center.y = to.y;
    this.clampCenter();
    this.modified = true;
  }

  changeZoom(amount: number) {
    this.zoom += amount;
    this.clampZoom();
    this.modified = true;
  }

  setZoom(zoom: number) {
    if (this.zoom !== zoom) {
      this.zoom = zoom;
      this.clampZoom();
      this.modified = true;
    }
  }

  setViewport(dimensions: Vector, projectionMatrix: Mat4Uniform): void {
    if (!dimensions.equals(this.viewport)) {
      console.log('setting projection matrix', dimensions, this.center, this.zoom);
      this.viewport = dimensions.copy();
      this.modified = true;
      const tileDimensions = new Vector(dimensions.x / this.zoom, dimensions.y / this.zoom);
      const left = this.center.x - tileDimensions.x / 2;
      const bottom = this.center.y - tileDimensions.y / 2;
      console.log(left, bottom, dimensions.x / this.zoom, dimensions.y / this.zoom);
      // Update the view / projection as needed
      projectionMatrix.reset().orthographic(left, bottom, tileDimensions.x, tileDimensions.y).set();
    }
  }

  cull(world: World) {
    this.oldChunks = new Array<Vector>();
    this.newChunks = new Array<Vector>();
    const [bottomLeft, topRight] = this.getBounds();
    const bottomLeftChunk = bottomLeft.toChunkSpace();
    const topRightChunk = topRight.toChunkSpace().clamp(world.size.toBaseZero());
    const currentChunksInView = new Map<string, Vector>();
    for (let x = bottomLeftChunk.x; x <= topRightChunk.x; x++) {
      for (let y = bottomLeftChunk.y; y <= topRightChunk.y; y++) {
        const vector = new Vector(x, y);
        currentChunksInView.set(vector.getIndexString(), vector);
      }
    }
    for (const [id, chunk] of currentChunksInView) {
      if (!this.chunksInView.has(id)) {
        this.newChunks.push(chunk);
      }
    }
    for (const [id, chunk] of this.chunksInView) {
      if (!currentChunksInView.has(id)) {
        this.oldChunks.push(chunk);
      }
    }
    this.chunksInView = currentChunksInView;
    this.modified = false;
  }

  // Get bottomLeft and topRight tiles visible
  getBounds(): [Vector, Vector] {
    // The zoom indicates pixels per tile
    const viewportInTiles = new Vector(this.viewport.x / this.zoom, this.viewport.y / this.zoom);
    let bottomLeft = new Vector(this.center.x - viewportInTiles.x / 2, this.center.y - viewportInTiles.y / 2);
    let topRight = bottomLeft.add(viewportInTiles);
    // If the top/right of the viewport falls directonly on a tile starting, we need to exclude it or rendering more chunks than needed
    if (topRight.x % 1 === 0) {
      topRight.x = topRight.x - 1;
    }
    if (topRight.y % 1 === 0) {
      topRight.y = topRight.y - 1;
    }
    bottomLeft = bottomLeft.floor().clamp();
    topRight = topRight.floor();
    return [bottomLeft, topRight];
  }

  setOrthographicBounds(viewport: Vector, matrix: Mat4Uniform): void {}

  clampCenter() {
    if (this.center.x < 0) {
      this.center.x = 0;
    }
    if (this.center.y < 0) {
      this.center.y = 0;
    }
  }

  clampZoom() {
    if (this.zoom > 128) {
      this.zoom = 128;
    }
    if (this.zoom < 8) {
      this.zoom = 8;
    }
  }
}
