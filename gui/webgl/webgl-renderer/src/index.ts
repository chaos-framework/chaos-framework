import { Entity, Vector, World } from '@chaos-framework/core';
import { QueryAPI } from '@chaos-framework/api';

import Mesh from './3D/Mesh.js';
import Camera from './Camera.js';
import TexturedShader2D from './3D/Shaders/2D/Textured/shader.js';
import Texture from './3D/Texture.js';
import Atlas from './3D/Atlas';
import WorldMeshLibrary from './WorldMeshLibrary.js';

export default class WebGL2D {
  gl: WebGLRenderingContext;

  world?: World;
  worldMeshLibrary!: WorldMeshLibrary;

  camera: Camera;
  aspectRatio!: number;

  texturedShader: TexturedShader2D;
  quad: Mesh;
  glyphTexture: Texture;
  worldTexture: Texture;
  atlas: Atlas;

  previousRenderTimestamp: DOMHighResTimeStamp = performance.now();
  rotation: number = 0;

  previousWidth: number;
  previousHeight: number;

  constructor(public canvas: HTMLCanvasElement, public api: QueryAPI) {
    const gl = canvas.getContext('webgl');
    if (gl === null) {
      throw new Error('Invalid WebGL Canvas context given.');
    }
    this.gl = gl;

    this.camera = new Camera(
      new Vector(4, 4),
      16,
      new Vector(this.canvas.clientWidth, this.canvas.clientHeight)
    );

    this.previousWidth = this.canvas.clientWidth;
    this.previousHeight = this.canvas.clientHeight;

    this.texturedShader = new TexturedShader2D(gl);
    this.quad = Mesh.quad(gl);
    this.atlas = new Atlas(gl);
    this.glyphTexture = new Texture(gl, 'http://localhost:3000/Unknown_curses_12x12.png');
    this.worldTexture = new Texture(gl, 'http://localhost:3000/tiles.png');
    this.texturedShader.bindTexture(this.glyphTexture);
    this.resize(new Vector(this.canvas.width, this.canvas.height));
    const worlds = api.worlds().value;
    this.setWorld(Array.from(worlds.values())[0]);

    window.requestAnimationFrame(this.tick.bind(this));
  }

  tick(timestamp: DOMHighResTimeStamp) {
    const delta = timestamp - this.previousRenderTimestamp;
    this.previousRenderTimestamp = timestamp;

    this.update(delta);
    this.render(delta);

    // Tell the window to render again ASAP
    window.requestAnimationFrame(this.tick.bind(this));
  }

  update(delta: number) {
    const { world, camera } = this;
    if (world !== undefined) {
      if (camera.modified) {
        camera.cull(world);
        this.worldMeshLibrary.remove(camera.oldChunks);
        this.worldMeshLibrary.add(camera.newChunks);
      }
    }
  }

  setWorld(world: World) {
    if (world !== this.world) {
      this.world = world;
      this.worldMeshLibrary?.clear();
      this.worldMeshLibrary = new WorldMeshLibrary(this.gl, this.api, world);
      this.camera.chunksInView.clear();
      this.camera.modified = true;
    }
  }

  resize(newSize: Vector) {
    this.canvas.width = newSize.x;
    this.canvas.height = newSize.y;
    this.aspectRatio = newSize.x / newSize.y;
    this.texturedShader.use();
    this.camera.setViewport(newSize, this.texturedShader.projection);
  }

  render(delta: number) {
    const { gl } = this;

    this.rotation += (delta / 1000) * 360;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable the depth test
    gl.disable(gl.DEPTH_TEST);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Set the viewport size based on the current HTML canvas size
    if (this.previousWidth !== this.canvas.clientWidth || this.previousHeight !== this.canvas.clientHeight) {
      console.log('GL size change!');
      this.resize(new Vector(this.canvas.clientWidth, this.canvas.clientHeight));
      this.previousWidth = this.canvas.clientWidth;
      this.previousHeight = this.canvas.clientHeight;
    }
    gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // TODO z buffer blending

    if (this.world !== undefined) {
      // Render world
      this.texturedShader.use();
      this.texturedShader.bindTexture(this.worldTexture);
      for (const [, chunkPosition] of this.camera.chunksInView) {
        const tilePosition = chunkPosition.toRealSpace();
        this.texturedShader.model.reset().translate(tilePosition.x, tilePosition.y).set();
        this.texturedShader.draw(this.worldMeshLibrary.getMesh('base', tilePosition.serialize()));
      }
      // Render entities
      this.texturedShader.bindTexture(this.glyphTexture);
      const visibleEntities = WebGL2D.getVisibleEntities(this.world, this.camera);
      for (const entity of visibleEntities) {
        this.texturedShader.model.reset().translateToTile(entity.position.x, entity.position.y).set();
        this.texturedShader.draw(this.atlas.quads[entity.glyph]);
      }
    }
  }

  static getVisibleEntities(world: World, camera: Camera): Entity[] {
    const visibleEntities = [];
    for (const [id, chunk] of camera.chunksInView) {
      const entities = world.entitiesByChunk.get(id);
      if (entities !== undefined) {
        for (const [, entity] of entities) {
          visibleEntities.push(entity);
        }
      }
    }
    return visibleEntities;
  }

  shutdown() {}
}
