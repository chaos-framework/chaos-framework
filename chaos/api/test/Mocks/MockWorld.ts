import { ArrayChunk, ByteLayer, Vector, World } from '@chaos-framework/core';

export default class MockWorld extends World {
  constructor(fill: number = 0) {
    super({ baseLayer: new ByteLayer(fill), size: new Vector(2, 2), streaming: false });
  }

  initializeChunk(x: number, y: number, data?: { [key: string]: any }): void {
    this.baseLayer.setChunk(x, y, new ArrayChunk<number>(0, data?.['base']));
  }

  serialize() {
    return '';
  }
}
