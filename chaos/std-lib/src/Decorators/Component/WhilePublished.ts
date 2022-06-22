import { Action, Component, Entity, Player, Team, World } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/**
 * Runs handler only when parent is published. For components attached to the game context
 * itself this will always return `true`
 */
export const WhilePublished = BoundConditionalGenerator(function (this: Component, action: Action) {
  return this.parent?.isPublished() || false;
});
