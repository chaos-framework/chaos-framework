import { Chunk, Component, Entity, Layer, World } from '@chaos-framework/core';

import { IndividualQuery, CollectionQuery, ComponentQuery, LayerQuery } from '../internal.js';
import { EntityQuery } from './EntityQuery.js';
import { RelativeCollectionQuery } from './Query.ts.js';

export class WorldQuery extends IndividualQuery<World> {
  constructor(world: World) {
    super(world.id, world);
  }

  id() {
    return new IndividualQuery<string>(this.append('id'), this.value.id);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  components() {
    return new CollectionQuery<Component, ComponentQuery>(
      this.append('components'),
      this.value.components.all,
      ComponentQuery
    );
  }

  entities() {
    return new CollectionQuery<Entity, EntityQuery>(
      this.append('entities'),
      this.value.entities,
      EntityQuery
    );
  }

  layers() {
    return new RelativeCollectionQuery<Layer<Chunk<any>>, LayerQuery>(
      this.append('layers'),
      this.value.layers,
      LayerQuery
    );
  }
}
