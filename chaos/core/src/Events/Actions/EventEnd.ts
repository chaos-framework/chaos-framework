import {
  Event,
  Action,
  ActionParameters,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator,
  ComponentContainer
} from '../../internal.js';

export class EventEnd extends Action<ComponentContainer> {
  actionType: ActionType = ActionType.EVENT_BEGIN;
  broadcastType = BroadcastType.FULL;

  constructor(
    public beginningId: string,
    { caster, using, metadata }: EventEnd.Params = {}
  ) {
    super({ caster, using, metadata });
  }

  async *apply(): ProcessEffectGenerator {
    return true;
  }

  serialize(): EventEnd.Serialized {
    return {
      ...super.serialize(),
      beginningId: this.beginningId
    }
  }

  static deserialize(json: EventEnd.Serialized): EventEnd {
    const params = { 
      ...Action.deserializeCommonFields(json)
    }
    return new EventEnd(json.beginningId, params);
  }
}

// tslint:disable-next-line: no-namespace
export namespace EventEnd {
  export interface Params extends ActionParameters {
    
  }

  export interface Serialized extends Action.Serialized {
    beginningId: string;
  }
}
