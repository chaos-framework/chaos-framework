import { Action, Component } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/** Runs handler only if `action.applied === true` */
export const Applied = BoundConditionalGenerator<Component>(function (
  this: Component,
  action: Action
) {
  return action.applied;
});

export const Successful = Applied;
