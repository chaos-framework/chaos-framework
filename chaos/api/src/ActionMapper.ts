import {
  Action,
  Chaos,
  PublishEntityAction,
  PublishPlayerAction,
  UnpublishEntityAction
} from '@chaos-framework/core';

type Update = { path: string; value: any; predicate?: any };

export class ActionMapper {
  static mapActionToPotentialSubscriptions(action: Action): Update[] {
    const arr: Update[] = [];
    let predicate: any;
    const add = (path: string, value: any) => arr.push({ path, value, predicate });
    // PUBLISH PLAYER ACTION
    if (action instanceof PublishPlayerAction) {
      // All players and the team the player may belong to
      predicate = action.player;
      const teamId = action.player.team?.id;
      add('players', Chaos.players);
      if (teamId !== undefined) {
        add(`${teamId}.players`, Chaos.players);
      }
      return arr;
    }
    // PUBLISH ENTITY ACTION
    else if (action instanceof PublishEntityAction) {
      predicate = action.entity;
      // ALL
      add('entities', Chaos.entities);
      // WORLD
      // add(`${action.world.id}`, action.world.entities);
      // PLAYERS
      for (const player of Array.from(action.entity.players.values())) {
        add(`${player.id}.entities`, player.entities);
      }
      // TEAM
      const teamId = action.entity.team?.id;
      if (teamId !== undefined) {
        add(`${teamId}.entities`, action.entity.team!.entities);
      }
      return arr;
    }
    // UNPUBLISH ENTITY ACTION
    else if (action instanceof UnpublishEntityAction) {
      predicate = action.entity;
      // ALL
      add('entities', Chaos.entities);
      // WORLD
      // add(`${action.entity.world!.id}`, action.entity.world!.entities);
      // PLAYERS
      for (const player of Array.from(action.entity.players.values())) {
        add(`${player.id}.entities`, player.entities);
      }
      // TEAM
      const teamId = action.entity.team?.id;
      if (teamId !== undefined) {
        add(`${teamId}.entities`, action.entity.team!.entities);
      }
      return arr;
    }
    return arr;
  }
}
