import { Action, Component } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/** Runs handler only if `action.applied === false` */
export const Failed = BoundConditionalGenerator(function (this: Component, action: Action) {
  return !action.applied;
});
