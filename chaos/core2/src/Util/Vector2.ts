import { clamp, toInteger } from 'lodash-es';
import { bresenhamGenerator, Point } from './Bresenham.js';

const CHUNK_WIDTH = 16;

export class Vector2 {
  x: number;
  y: number;

  static fromIndexString(s: string): Vector2 {
    const values = s.split('_').map((v) => toInteger(v));
    if (values.length < 2) {
      throw new Error();
    }
    return new Vector2(toInteger(values[0]), toInteger(values[1]));
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: Vector2): boolean {
    return other.x === this.x && other.y === this.y;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  // Multiply magnitude
  multiply(by: number): Vector2 {
    return new Vector2(this.x * by, this.y * by);
  }

  absolute(): Vector2 {
    return new Vector2(Math.abs(this.x), Math.abs(this.y));
  }

  // Check if another vector is within (less than OR EQUAL to) a circular range
  withinRadius(other: Vector2, radius: number): boolean {
    const magnitude =
      0.0 + Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));
    return magnitude <= radius;
  }

  // Return a new copy of this vector
  copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  floor(): Vector2 {
    return new Vector2(Math.floor(this.x), Math.floor(this.y));
  }

  ceil(): Vector2 {
    return new Vector2(Math.ceil(this.x), Math.ceil(this.y));
  }

  // Clamps to zero-based square of size given
  clamp(size?: Vector2): Vector2 {
    return new Vector2(
      clamp(this.x, 0, size ? size.x : Number.MAX_VALUE),
      clamp(this.y, 0, size ? size.y : Number.MAX_VALUE)
    );
  }

  area(): number {
    return this.x * this.y;
  }

  copyAdjusted(x: number, y: number): Vector2 {
    return new Vector2(this.x + x, this.y + y);
  }

  toRealSpace(): Vector2 {
    return new Vector2(Math.floor(this.x * CHUNK_WIDTH), Math.floor(this.y * CHUNK_WIDTH));
  }

  toChunkSpace(): Vector2 {
    return new Vector2(Math.floor(this.x / CHUNK_WIDTH), Math.floor(this.y / CHUNK_WIDTH));
  }

  toChunkSpaceCeil(): Vector2 {
    return new Vector2(Math.ceil(this.x / CHUNK_WIDTH), Math.ceil(this.y / CHUNK_WIDTH));
  }

  toBaseZero(): Vector2 {
    return new Vector2(this.x > 0 ? this.x - 1 : 0, this.y > 0 ? this.y - 1 : 0);
  }

  differentChunkFrom(other: Vector2): boolean {
    return !this.toChunkSpace().equals(other.toChunkSpace());
  }

  isOrthogonalTo(other: Vector2): boolean {
    return this.x === other.x || this.y === other.y;
  }

  isDiagonalTo(other: Vector2): boolean {
    return Math.abs(this.x - other.x) === Math.abs(this.y - other.y);
  }

  getIndexString(): string {
    return this.x.toString() + '_' + this.y.toString();
  }

  getLineTo(other: Vector2): Vector2[] {
    // TODO using external lib for some reason.. expensive to cast, should rewrite bresenham
    const vectors: Vector2[] = [];
    for (const point of this.getLineToIterable(other)) {
      vectors.push(new Vector2(point.x, point.y));
    }
    return vectors;
  }

  getLineToIterable(other: Vector2): Generator<Point> {
    return bresenhamGenerator(this.x, this.y, other.x, other.y);
  }

  length(): number {
    return Math.sqrt((this.x ^ 2) + (this.y ^ 2));
  }

  // CRAPPY DO NOT USE
  dot(other: Vector2): number {
    // return Math.round(Math.acos((1.0 * this.x * other.x + 1.0 * this.y * other.y) / (Math.sqrt(this.length() * Math.sqrt(other.length())))) * 100) / 100;
    return this.x * other.x + this.y * other.y;
  }

  sameDirectionAs(other: Vector2): boolean {
    return this.dot(other) === 1;
  }

  serialize(): string {
    return this.getIndexString();
  }

  static deserialize(s: string): Vector2 {
    return Vector2.fromIndexString(s);
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static max(): Vector2 {
    return new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  }

  // TODO distance, cast ray between two points, etc
}

const iterableVectorLine = function* (start: Vector2, end: Vector2) {
  const x0 = start.x;
  const y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  let eps = 0;
  const sx = dx > 0 ? 1 : -1;
  const sy = dy > 0 ? 1 : -1;
  if (adx > ady) {
    for (let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
      yield new Vector2(x, y);
      eps += ady;
      // tslint:disable-next-line: no-bitwise
      if (eps << 1 >= adx) {
        y += sy;
        eps -= adx;
      }
    }
  } else {
    for (let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
      yield new Vector2(x, y);
      eps += adx;
      // tslint:disable-next-line: no-bitwise
      if (eps << 1 >= ady) {
        x += sx;
        eps -= ady;
      }
    }
  }
};
