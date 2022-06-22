import { Chaos, Game, Action, Entity, Team, Player, World } from '@chaos-framework/core';
import _ from 'lodash';

import {
  ActionMapper,
  IndividualQuery,
  CollectionQuery,
  EntityQuery,
  PlayerQuery,
  TeamQuery,
  Query,
  WorldQuery
} from './internal.js';

export class QueryAPI {
  subscriptions: any = {};

  constructor(public game?: Game, public chaos?: typeof Chaos) {
    Chaos.attachExecutionHook(this.boundHook);
  }

  unload() {
    Chaos.detachExecutionHook(this.boundHook);
  }

  hook(actions: Action[]): void {
    for (const action of actions) {
      const updates = ActionMapper.mapActionToPotentialSubscriptions(action);
      for (const update of updates) {
        const { path, value, predicate } = update;
        const subscribers = _.get(this.subscriptions, path);
        if (subscribers !== undefined) {
          // TODO cache paths and corresponding values + predicates, only run functions once, this method wastes renders
          _.forIn(subscribers, (v, k, o) => {
            v(value, predicate);
          });
        }
      }
    }
  }
  readonly boundHook = this.hook.bind(this);

  addSubsciption(subscription: string | Query, key: string, callback: Function): string {
    let path = `${typeof subscription === 'string' ? subscription : subscription.path}.${key}`;
    _.set(this.subscriptions, path, callback);
    return path;
  }

  removeSubscription(subscription: string) {
    _.unset(this.subscriptions, subscription);
  }

  // Top-level queries

  players(): CollectionQuery<Player, PlayerQuery> {
    return new CollectionQuery('players', Chaos.players, PlayerQuery);
  }

  currentTurn(): IndividualQuery<Entity | Player | Team | undefined> {
    return new IndividualQuery('currentTurn', Chaos.currentTurn);
  }

  teams(): CollectionQuery<Team, TeamQuery> {
    return new CollectionQuery('teams', Chaos.teams, TeamQuery);
  }

  worlds(): CollectionQuery<World, WorldQuery> {
    return new CollectionQuery('worlds', Chaos.worlds, WorldQuery);
  }

  entities(): CollectionQuery<Entity, EntityQuery> {
    return new CollectionQuery('entities', Chaos.entities, EntityQuery);
  }
}
