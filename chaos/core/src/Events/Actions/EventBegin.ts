import {
  Event,
  Action,
  ActionParameters,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator,
  ComponentContainer,
  EventEnd
} from '../../internal.js';

// what to call this.. phase is taken.. THESAURUS TIME BABY
export class EventBegin extends Action<ComponentContainer> {
  actionType: ActionType = ActionType.EVENT_BEGIN;
  broadcastType = BroadcastType.FULL;

  constructor(
    { caster, using, metadata }: EventBegin.Params = {}
  ) {
    super({ caster, using, metadata });
  }

  async *apply(): ProcessEffectGenerator {
    return true;
  }

  serialize(): EventBegin.Serialized {
    return {
      ...super.serialize()
    }
  }

  static deserialize(json: EventBegin.Serialized): EventBegin {
    const params = { ...Action.deserializeCommonFields(json) }
    return new EventBegin(params);
  }

  end(): EventEnd {
    return new EventEnd(
      this.id
    );
  }
}

// tslint:disable-next-line: no-namespace
export namespace EventBegin {
  export interface Params extends ActionParameters {
    
  }

  export interface Serialized extends Action.Serialized {
  }
}
