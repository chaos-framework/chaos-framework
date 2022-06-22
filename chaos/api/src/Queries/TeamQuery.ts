import { Entity, Player, Team } from '@chaos-framework/core';

import { IndividualQuery, EntityQuery, CollectionQuery, PlayerQuery } from '../internal.js';

export class TeamQuery extends IndividualQuery<Team> {
  constructor(item: Team, path?: string) {
    super(item.id, item);
  }

  id() {
    return new IndividualQuery<string>(this.append('id'), this.value.id);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  entities() {
    return new CollectionQuery<Entity, EntityQuery>(
      this.append('entities'),
      this.value.entities,
      EntityQuery
    );
  }

  sensedEntities() {
    return new CollectionQuery<Entity, EntityQuery>(
      this.append('sensedEntities'),
      this.value.sensedEntities.map,
      EntityQuery
    );
  }

  players() {
    return new CollectionQuery<Player, PlayerQuery>(this.append('players'), this.value.players, PlayerQuery);
  }
}
