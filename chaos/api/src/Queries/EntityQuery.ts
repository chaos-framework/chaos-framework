import { Component, Entity, Player, Team, World } from '@chaos-framework/core';

import {
  IndividualQuery,
  CollectionQuery,
  PlayerQuery,
  ComponentQuery,
  WorldQuery,
  TeamQuery
} from '../internal.js';
import { RelativeCollectionQuery } from './Query.js';

export class EntityQuery extends IndividualQuery<Entity> {
  constructor(entity: Entity) {
    super(entity.id, entity);
  }

  id() {
    return new IndividualQuery<string>(this.append('id'), this.value.id);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  // TODO abilities

  world() {
    return new WorldQuery(this.value.world!);
  }

  components() {
    return new CollectionQuery<Component, ComponentQuery>(
      this.append('components'),
      this.value.components.all,
      ComponentQuery
    );
  }

  players(): CollectionQuery<Player, PlayerQuery> {
    return new CollectionQuery<Player, PlayerQuery>(this.append('players'), this.value.players, PlayerQuery);
  }

  team(): TeamQuery | undefined {
    return new TeamQuery(this.value.team!, this.append('team'));
  }
}
