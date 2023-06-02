import { Entity, Value, PropertyThresholdAction, chaosUniqueId } from '../../internal.js';

export type ValueType = 'current' | 'min' | 'max';
export type ThresholdState = 'out' | 'in' | 'equals';

export class Property implements Property {
  entity: Entity;
  name: string;
  current: Value;
  min: Value;
  max: Value;

  // Relationships of current base value to minimum and maximum thresholds
  minState: 'out' | 'in' | 'equals';
  maxState: 'out' | 'in' | 'equals';

  constructor(
    entity: Entity,
    name: string,
    current: number = 0,
    min: number = -Infinity,
    max: number = Infinity
  ) {
    this.entity = entity;
    this.name = name;
    this.current = new Value(this, 'current', current);
    this.min = new Value(this, 'min', min);
    this.max = new Value(this, 'max', max);

    this.minState = this.getMinState();
    this.maxState = this.getMaxState();
  }

  getMinState(): ThresholdState {
    if (this.min !== undefined) {
      return this.current.calculated < this.min.calculated
      ? 'out'
      : this.current.calculated > this.min.calculated
      ? 'in'
      : 'equals';
    } else {
      return 'in';
    }
  }

  updateMinState(): ThresholdState | undefined {
    const newState = this.getMinState();
    if (newState !== this.minState) {
      this.minState = newState;
      return newState;
    }
  }

  getMaxState(): ThresholdState {
    if (this.max !== undefined) {
      return this.current.calculated > this.max.calculated
        ? 'out'
        : this.current.calculated < this.max.calculated
        ? 'in'
        : 'equals';
    } else {
      return 'in';
    }
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
      thresholdValue: this.min?.calculated || 0,
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
      thresholdValue: this.max?.calculated || 0,
      newState: this.maxState
    });
  }

  serializeForClient(): Property.SerializedForClient {
    return {
      name: this.name,
      current: this.current.calculated,
      min: this.min.calculated,
      max: this.max.calculated,
    }
  }
}

// tslint:disable-next-line: no-namespace
export namespace Property {
  export interface Serialized {}

  export interface SerializedForClient {
    name: string;
    current: number;
    min?: number;
    max?: number;
  }

  export function Deserialize(json: Entity.Serialized): Property {
    throw new Error('Not yet implemented.');
  }

  export function DeserializeAsEntity(entity: Entity, json: Property.SerializedForClient): Property {
    try {
      const { name, current, min, max } = json;
      const deserialized = new Property(
        entity,
        name,
        current,
        min,
        max
      );
      return deserialized;
    } catch (error) {
      throw error;
    }
  }
}
