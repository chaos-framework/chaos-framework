import { Action, Component } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/**
 * Runs handler only if the action targets this component's parent
 * Can be an entity, team, etc
 */
export const TargetsMyParent = BoundConditionalGenerator(function (this: Component, action: Action) {
  return this.parent !== undefined && action.target === this.parent;
});
