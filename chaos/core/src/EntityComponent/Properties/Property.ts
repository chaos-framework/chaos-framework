import { Entity, Value, PropertyThresholdAction, chaosUniqueId } from '../../internal.js';

export type ValueType = 'current' | 'min' | 'max';
export type ThresholdState = 'out' | 'in' | 'equals';

export class Property implements Property {
  readonly id: string;

  entity: Entity;
  name: string;
  current: Value;
  min: Value;
  max: Value;

  // Relationships of current base value to minimum and maximum thresholds
  minState: 'out' | 'in' | 'equals';
  maxState: 'out' | 'in' | 'equals';

  constructor(
    id = chaosUniqueId(),
    entity: Entity,
    name: string,
    current: number = 0,
    min: number = -Infinity,
    max: number = Infinity
  ) {
    this.id = id;
    this.entity = entity;
    this.name = name;
    this.current = new Value(this, 'current', current);
    this.min = new Value(this, 'min', min);
    this.max = new Value(this, 'max', max);

    this.minState = this.getMinState();
    this.maxState = this.getMaxState();
  }

  getValue(type: ValueType) {
    return this[type].calculated;
  }

  getMinState(): ThresholdState {
    return this.current.calculated < this.min.calculated
      ? 'out'
      : this.current.calculated > this.min.calculated
      ? 'in'
      : 'equals';
  }

  updateMinState(): ThresholdState | undefined {
    const newState = this.getMinState();
    if (newState !== this.minState) {
      this.minState = newState;
      return newState;
    }
  }

  getMaxState(): ThresholdState {
    return this.current.calculated > this.max.calculated
      ? 'out'
      : this.current.calculated < this.max.calculated
      ? 'in'
      : 'equals';
  }

  updateMaxState(): ThresholdState | undefined {
    const newState = this.getMaxState();
    if (newState !== this.maxState) {
      this.maxState = newState;
      return newState;
    }
  }

  getMinThresholdAction({
    caster,
    target,
    previousValue,
    adjustmentAction,
    oldState,
    using,
    metadata
  }: PropertyThresholdAction.PropertyParams) {
    return new PropertyThresholdAction({
      caster,
      target,
      propertyName: this.name,
      newValue: this.current.calculated,
      adjustmentAction,
      previousValue,
      oldState,
      using,
      metadata,
      threshold: 'min',
      thresholdValue: this.min.calculated,
      newState: this.minState
    });
  }

  getMaxThresholdAction({
    caster,
    target,
    previousValue,
    adjustmentAction,
    oldState,
    using,
    metadata
  }: PropertyThresholdAction.PropertyParams) {
    return new PropertyThresholdAction({
      caster,
      target,
      propertyName: this.name,
      newValue: this.current.calculated,
      adjustmentAction,
      previousValue,
      oldState,
      using,
      metadata,
      threshold: 'max',
      thresholdValue: this.max.calculated,
      newState: this.maxState
    });
  }
}

// tslint:disable-next-line: no-namespace
export namespace Property {
  export interface Serialized {}

  export interface SerializedForClient {
    id: string;
    name: string;
    current: Value;
    min: Value;
    max: Value;
  }

  export function Deserialize(json: Entity.Serialized): Entity {
    throw new Error('Not yet implemented.');
  }

  export function DeserializeAsClient(json: Entity.SerializedForClient): Entity {
    try {
      const { id, name, metadata, team, active, omnipotent, components, world: worldId, glyph } = json;
      const deserialized = new Entity({
        id,
        name,
        metadata,
        active,
        omnipotent,
        glyph,
        permanentComponents: [] as Component[]
      });
      deserialized.position = Vector.deserialize(json.position);
      if (worldId !== undefined) {
        const world = Chaos.getWorld(worldId);
        if (world !== undefined) {
          deserialized.world = world;
        }
      }
      if (team !== undefined) {
        const t = Chaos.teams.get(team);
        if (t === undefined) {
          throw new Error(`Team for Entity ${id} is not defined locally.`);
        }
        deserialized.team = t;
      }
      if (components !== undefined) {
        for (let c of components) {
          deserialized._attach(Component.DeserializeAsClient(c));
        }
      }
      return deserialized;
    } catch (error) {
      throw error;
    }
  }
}
