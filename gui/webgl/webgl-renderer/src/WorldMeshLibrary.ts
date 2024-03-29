import { Vector, World, chaosUniqueId } from '@chaos-framework/core';
import { QueryAPI, WorldQuery } from '@chaos-framework/api';

import Mesh from './3D/Mesh.js';
import Texture from './3D/Texture.js';

export default class WorldMeshLibrary {
  id = chaosUniqueId();
  layers: any = {};
  query: WorldQuery;

  constructor(private gl: WebGLRenderingContext, public api: QueryAPI, public world: World) {
    console.log(`new world mesh library for world ${world.id}`);
    this.query = api.worlds().get(world.id)!;
    for (const [name, layer] of world.layers) {
      // TODO more than base. right now assuming number[][] but eventually will get rendering metadata..
      if (name === 'base') {
        this.layers[name] = {
          query: this.query.layers().get(name)!,
          chunks: {}
        };
      }
    }
  }

  add(positions: Vector[]) {
    console.log(`adding positions ${positions.map((position) => position.serialize())}`);
    for (const position of positions) {
      const serialized = position.serialize();
      for (const [name, layer] of Object.entries(this.layers) as [string, any][]) {
        const query = layer.query.chunks().get(serialized).tiles();
        layer.chunks[serialized] = {
          hookId: this.api.addSubsciption(query, this.id, () => this.update(position, name)),
          mesh: Mesh.generateWorldMesh(this.gl, query.value) // TODO make async
        };
      }
    }
  }

  remove(positions: Vector[]) {
    for (const position of positions) {
      const serialized = position.serialize();
      for (const [name, layer] of Object.entries(this.layers) as [string, any][]) {
        const chunk = layer.chunks[serialized];
        // Release UVS ONLY! Indices and vertices shared for all world meshes currently.
        chunk.mesh.releaseUvs();
        this.api.removeSubscription(chunk.hookId);
        delete layer.chunks[serialized];
      }
    }
  }

  update(position: Vector, layerName: string) {}

  getMesh(layer: string, positionIndex: string) {
    return this.layers[layer].chunks[positionIndex].mesh;
  }

  clear() {
    for (const [name, layer] of this.layers) {
      for (const [position, chunk] of layer) {
        chunk.mesh.releaseUvs();
        this.api.removeSubscription(chunk.hookId);
      }
    }
  }
}
