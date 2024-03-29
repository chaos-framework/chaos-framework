import {
  Action,
  Chaos,
  PropertyChangeAction,
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
      predicate = action.target;
      const teamId = action.target.team?.id;
      add('players', Chaos.players);
      if (teamId !== undefined) {
        add(`${teamId}.players`, Chaos.players);
      }
      return arr;
    }
    // PUBLISH ENTITY ACTION
    else if (action instanceof PublishEntityAction) {
      predicate = action.target;
      // ALL
      add('entities', Chaos.entities);
      // WORLD
      // add(`${action.world.id}`, action.world.entities);
      // PLAYERS
      for (const player of Array.from(action.target.players.values())) {
        add(`${player.id}.entities`, player.entities);
      }
      // TEAM
      const teamId = action.target.team?.id;
      if (teamId !== undefined) {
        add(`${teamId}.entities`, action.target.team!.entities);
      }
      return arr;
    }
    // UNPUBLISH ENTITY ACTION
    else if (action instanceof UnpublishEntityAction) {
      predicate = action.target;
      // ALL
      add('entities', Chaos.entities);
      // WORLD
      // add(`${action.entity.world!.id}`, action.entity.world!.entities);
      // PLAYERS
      for (const player of Array.from(action.target.players.values())) {
        add(`${player.id}.entities`, player.entities);
      }
      // TEAM
      const teamId = action.target.team?.id;
      if (teamId !== undefined) {
        add(`${teamId}.entities`, action.target.team!.entities);
      }
      return arr;
    }
    // PROPERTY ADJUSTMENT
    else if (action instanceof PropertyChangeAction) {
      predicate = action.target;
      // Just the property
      add(`${action.target.id}_${action.property.name}_${action.value}`, action.property[action.value].calculated);
      return arr;
    }
    return arr;
  }
}
