import { Action, Component, Entity } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/**
 * Runs handler only if the component parent is an Entity,
 * the entity belongs to a team, and the entity being targetted
 * by this action is on the same team (this includes the entity
 * itself).
 */
export const TargetsMyTeam = BoundConditionalGenerator(function (
  this: Component<Entity>,
  action: Action<Entity>
) {
  return this.parent?.team !== undefined && action.target?.team === this.parent?.team;
});
