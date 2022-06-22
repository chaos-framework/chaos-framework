import { Entity, Player } from '@chaos-framework/core';

import { IndividualQuery, EntityQuery, CollectionQuery } from '../internal.js';

export class PlayerQuery extends IndividualQuery<Player> {
  constructor(item: Player, path?: string) {
    super(item.id, item);
  }

  id() {
    return new IndividualQuery<string>(this.append('id'), this.value.id);
  }

  username() {
    return new IndividualQuery<string>(this.append('username'), this.value.username);
  }

  entities() {
    return new CollectionQuery<Entity, EntityQuery>(
      this.append('entities'),
      this.value.entities,
      EntityQuery
    );
  }
}
