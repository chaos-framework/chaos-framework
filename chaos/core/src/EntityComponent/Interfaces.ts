import { Action, Entity, NestedMap } from '../internal.js';

export interface Identifiable {
  id: string;
}

export interface Listener {
  handle(phase: string, action: Action): void;
}

export interface CachesSensedEntities {
  sensedEntities: NestedMap<Entity>;
}

export function cachesSensedEntities(o: any): o is CachesSensedEntities {
  return o.sensedEntities !== undefined;
}

// SCOPE

export type Scope = 'entity' | 'world' | 'player' | 'team' | 'game';

export type ComponentScope = Map<string, Scope>;
