import { Action, Component, ComponentContainer } from '@chaos-framework/core';
import { BoundConditionalGenerator } from '../BoundConditionalGenerator.js';

/** Runs handler only if `action.target === this.parent` */
export const TargetsMe = BoundConditionalGenerator(function (
  this: Component | ComponentContainer,
  action: Action
) {
  return action.target === (this instanceof Component ? this.parent : this);
});
