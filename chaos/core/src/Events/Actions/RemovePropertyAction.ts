import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class RemovePropertyAction extends Action<Entity> {
  actionType: ActionType = ActionType.REMOVE_PROPERTY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  name: string;

  constructor({ caster, target, name, using, metadata }: RemovePropertyAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.name = name;
  }

  async *apply(): ProcessEffectGenerator {
    return this.target._removeProperty(this.name);
  }
}

export namespace RemovePropertyAction {
  export interface EntityParams extends ActionParameters<Entity> {
    name: string;
  }
  export interface Params extends EntityParams {
    target: Entity;
  }
}
