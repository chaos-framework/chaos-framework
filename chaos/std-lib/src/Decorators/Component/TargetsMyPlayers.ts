import { Action, Component, Entity } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/**
 * Runs the handler only if the component is attached to an entity, the entity
 * belongs to any non-zero number of players, and the action is targetting an entity any
 * of those players own (this includes the entity itself).
 */
export const TargetsMyPlayers = BoundConditionalGenerator(function (
  this: Component,
  action: Action
) {
  if (this.parent instanceof Entity && action.target instanceof Entity) {
    for (const player of this.parent.players.values()) {
      if (player.entities.has(action.target.id)) {
        return true;
      }
    }
  }
  return false;
});
