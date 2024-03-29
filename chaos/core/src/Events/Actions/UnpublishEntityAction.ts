import {
  Action,
  ActionParameters,
  Entity,
  Chaos,
  ActionType,
  BroadcastType,
  NestedSetChanges,
  ProcessEffectGenerator,
  Update
} from '../../internal.js';

export class UnpublishEntityAction extends Action<Entity> {
  actionType: ActionType = ActionType.UNPUBLISH_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  movementAction = true;

  chunkVisibilityChanges = new NestedSetChanges();

  constructor({ caster, target, using, metadata }: UnpublishEntityAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    // Let the abstract impl of execute know to let listeners react around the entity itself
    if (target.world !== undefined) {
      this.additionalListenPoints = [{ world: target.world, position: target.position }];
    }
    this.additionalListeners = [target];
  }

  async *apply(): ProcessEffectGenerator {
    this.applied = this.target._unpublish(this.chunkVisibilityChanges);
    return this.applied;
  }

  getEntity(): Entity {
    return this.target;
  }

  serialize(): UnpublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      target: this.target.id
    };
  }

  getSubscriptionAddressesAndValues(): Update[] {
    const updates: Update[] = [
      {
        path: `entities`,
        value: Chaos.entities,
        predicate: this.target
      }
    ];
    for (const player of this.target.players.values()) {
      updates.push({
        path: `${player.id}_entities`,
        value: player.entities,
        predicate: this.target
      });
    }
    if (this.target.team !== undefined) {
      updates.push({
        path: `${this.target.team.id}_entities`,
        value: this.target.team.entities,
        predicate: this.target
      });
    }
    return updates;
  }

  static deserialize(json: UnpublishEntityAction.Serialized): UnpublishEntityAction {
    // Deserialize common fields
    const common = Action.deserializeCommonFields(json);
    // Deserialize unique fields
    const target = Chaos.entities.get(json.target);
    // Build the action if fields are proper, otherwise throw an error
    if (target === undefined) {
      throw new Error('UnpublishEntityAction fields not correct.');
    }
    return new UnpublishEntityAction({ ...common, target });
  }
}

export namespace UnpublishEntityAction {
  export interface EntityParams extends ActionParameters<Entity> {}

  export interface Params extends EntityParams {
    target: Entity;
  }

  export interface Serialized extends Action.Serialized {
    target: string;
  }
}
