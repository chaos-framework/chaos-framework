import {
  Action,
  Component,
  ActionParameters,
  Entity,
  ActionType,
  CachesSensedEntities,
  BroadcastType,
  NestedChanges,
  ProcessEffectGenerator
} from '../../internal.js';

export class SenseEntityAction extends Action<Entity, Entity> {
  actionType: ActionType = ActionType.SENSE_ENTITY_ACTION;
  broadcastType = BroadcastType.NONE;

  broadcast = false;

  caster: Entity; // entity sensing the other (senses cannot come from another entity)
  target: Entity; // entity being sensed
  using: Component & CachesSensedEntities; // component doing the sensing

  entityVisibilityChanges = new NestedChanges();

  constructor({ caster, target, using, metadata }: SenseEntityAction.Params) {
    super({ caster, using, metadata });
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  async *apply(): ProcessEffectGenerator {
    return this.caster._senseEntity(this.target, this.using, this.entityVisibilityChanges);
  }
}

// tslint:disable-next-line: no-namespace
export namespace SenseEntityAction {
  export interface EntityParams extends ActionParameters<Entity, Entity> {
    target: Entity;
    using: Component & CachesSensedEntities;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }
}
