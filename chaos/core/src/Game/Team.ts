// tslint:disable: forin
import { v4 as uuid } from 'uuid';

import {
  Chaos,
  Action,
  Viewer,
  ComponentContainer,
  Player,
  NestedMap,
  Entity,
  ComponentCatalog,
  Scope,
  NestedChanges,
  NestedSet,
  NestedSetChanges,
  EffectGenerator,
  Effect
} from '../internal.js';

export class Team implements Viewer, ComponentContainer {
  id: string = uuid();
  name: string;

  players = new Map<string, Player>();
  entities = new Map<string, Entity>();

  sensedEntities: NestedMap<Entity>;

  components: ComponentCatalog = new ComponentCatalog(this);

  visibleChunks: NestedSet;

  published = true; // TODO change this?

  constructor({ id = uuid(), name }: Team.ConstructorParams = {}) {
    this.id = id;
    this.name = name ? name : this.id.substring(this.id.length - 8);
    this.sensedEntities = new NestedMap<Entity>(id, 'team');
    this.visibleChunks = new NestedSet(id, 'team');
    Chaos.teams.set(this.id, this);
    Chaos.teamsByName.set(this.name, this);
  }

  isPublished(): boolean {
    return this.published;
  }

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    if (scope === 'game') {
      return Chaos.reference;
    }
    return undefined;
  }

  queueForBroadcast(action: Action, serialized?: any) {
    if (serialized === undefined) {
      serialized = action.serialize();
    }
    // Queue broadcast for all players
    for (const [, player] of this.players) {
      player.queueForBroadcast(action, serialized);
    }
  }

  async *handle(phase: string, action: Action): EffectGenerator {
    yield* this.components.handle(phase, action);
  }

  sense(a: Action): boolean {
    return true;
  }

  senseEntity(e: Entity): boolean {
    return true;
  }

  // TODO refactor as iterator for performance
  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.entries(), ...this.sensedEntities.map.entries()]);
  }

  // TODO action generator
  _addPlayer(player: Player): boolean {
    // Don't add the same player twice
    if (this.players.has(player.id)) {
      return false;
    }
    this.players.set(player.id, player);
    this.sensedEntities.addChild(player.sensedEntities);
    this.visibleChunks.addChild(player.visibleChunks);
    player._joinTeam(this);
    return true;
  }

  // TODO action generator
  _removePlayer(player: Player) {
    if (!this.players.has(player.id)) {
      return false;
    }
    this.players.delete(player.id);
    player._leaveTeam();
  }

  _publish(): boolean {
    if (!Chaos.teams.has(this.id)) {
      return false;
    } else {
      Chaos.teams.set(this.id, this);
      this.published = true;
      return true;
    }
  }

  serializeForClient(): Team.SerializedForClient {
    return { id: this.id, name: this.name };
  }

  // TODO action generator
  _addEntity(
    entity: Entity,
    chunkVisibilityChanges?: NestedSetChanges,
    entityVisibilityChanges?: NestedChanges
  ): boolean {
    if (this.entities.has(entity.id)) {
      return false;
    }
    this.entities.set(entity.id, entity);
    entity._joinTeam(this);
    this.visibleChunks.addChild(entity.visibleChunks, chunkVisibilityChanges);
    this.sensedEntities.addChild(entity.sensedEntities, entityVisibilityChanges);
    return true;
  }

  _removeEntity(
    entity: Entity,
    chunkVisibilityChanges?: NestedSetChanges,
    entityVisibilityChanges?: NestedChanges
  ): boolean {
    if (!this.entities.has(entity.id)) {
      return false;
    }
    this.entities.delete(entity.id);
    entity._leaveTeam();
    this.visibleChunks.removeChild(entity.id, chunkVisibilityChanges);
    this.sensedEntities.removeChild(entity.id, entityVisibilityChanges);
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace Team {
  export interface ConstructorParams {
    id?: string;
    name?: string;
  }

  export interface Serialized {
    id: string;
    name: string;
  }

  export interface SerializedForClient {
    id: string;
    name?: string;
  }

  export function Deserialize(json: Team.Serialized): Team {
    return new Team(json);
  }

  export function DeserializeAsClient(json: Team.SerializedForClient): Team {
    return new Team(json);
  }
}
