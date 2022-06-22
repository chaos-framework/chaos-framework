import { Action, Component } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/** Runs handler only if `action.permitted === true` */
export const Permitted = BoundConditionalGenerator(function (this: Component, action: Action) {
  return action.permitted;
});
