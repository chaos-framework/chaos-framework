import {
  Entity,
  Action,
  World,
  Component,
  Viewer,
  Player,
  Client,
  Team,
  ComponentCatalog,
  ComponentContainer,
  Scope,
  VisibilityType,
  CAST,
  ExecutionHook,
  ActionHook,
  Vector,
  EffectGenerator,
  Timeline
} from '../internal.js';

export let id: string = 'Unnamed Game'; // Name of loaded game
export function setId(value: string) {
  id = value;
}

let phases = ['modify', 'permit', 'react', 'output'];
let prePhases = ['modify', 'permit'];
let postPhases = ['react', 'output'];

export const adminClients: Map<string, Client> = new Map<string, Client>();

export const worlds: Map<string, World> = new Map<string, World>();
export const entities: Map<string, Entity> = new Map<string, Entity>();
export const allComponents: Map<string, Component> = new Map<string, Component>();

export const teams: Map<string, Team> = new Map<string, Team>();
export const teamsByName: Map<string, Team> = new Map<string, Team>();
export const players: Map<string, Player> = new Map<string, Player>();
export const playersWithoutTeams = new Map<string, Player>();

export let actionHooks = new Array<ActionHook>();
export let executionHooks = new Array<ExecutionHook>();

export const timeline = new Timeline();

export let currentTurn: Entity | Player | Team | undefined = undefined;
export function setCurrentTurn(to: Entity | Player | Team | undefined) {
  currentTurn = to;
}
export let currentTurnSetAt: number = Date.now();
export function setCurrentTurnSetAt(time?: number) {
  currentTurnSetAt = time !== undefined ? time : Date.now();
}

export let viewDistance = 6; // how far (in chunks) to load around active entities
export function setViewDistance(distance: number) {
  viewDistance = distance;
} // TODO make sure this doesn't get changed while any entities are published
export let inactiveViewDistance = 1; // how far (in chunks) to load around inactive entities when they enter an inactive world to check for permissions / modifiers
export let listenDistance = 25; // how far in tiles to let local entities listen to actions around casters and targets
export function setListenDistance(distance: number) {
  listenDistance = distance;
}
export type PerceptionGrouping = 'player' | 'team';
export let perceptionGrouping: PerceptionGrouping = 'player';
export function setPerceptionGrouping(value: 'player' | 'team') {
  perceptionGrouping = value;
}

// Kind of an ugly way to let the top-level game own components and link into event system
let initialReference: any = {
  id: '___GAMEREF',
  isPublished: () => true,
  getComponentContainerByScope: (scope: Scope) => reference,
  handle: handle
};
export let components = new ComponentCatalog(initialReference); // all components
export const reference: ComponentContainer = {
  ...initialReference,
  components: components
};

export function reset() {
  entities.clear();
  components.unpublish();
  components.clear();
  players.clear();
  playersWithoutTeams.clear();
  teams.clear();
  teamsByName.clear();
  worlds.clear();
  viewDistance = 6;
  actionHooks = new Array<ActionHook>();
  executionHooks = new Array<ExecutionHook>();
  currentTurn = undefined;
}

export function setPhases(pre: string[], post: string[]) {
  prePhases = pre;
  postPhases = post;
  phases = [...pre, ...post];
}

export function getPhases(): string[] {
  return phases;
}

export function setPrePhases(pre: string[]): void {
  prePhases = pre;
  phases = [...prePhases, ...postPhases];
}

export function setPostPhases(post: string[]): void {
  postPhases = post;
  phases = [...prePhases, ...postPhases];
}

export function getPrePhases(): string[] {
  return prePhases;
}

export function getPostPhases(): string[] {
  return postPhases;
}

export function attachExecutionHook(hook: ExecutionHook) {
  executionHooks.push(hook);
}

export function detachExecutionHook(hook: ExecutionHook) {
  const i = executionHooks.findIndex((existing) => existing === hook);
  if (i > -1) {
    executionHooks.splice(i, 1);
  }
}

export function attachActionHook(hook: ActionHook) {
  actionHooks.push(hook);
}

export function detachActionHook(hook: ActionHook) {
  const i = actionHooks.findIndex((existing) => existing === hook);
  if (i > -1) {
    actionHooks.splice(i, 1);
  }
}

export function castAsClient(msg: CAST): string | undefined {
  const { casterType, clientId, casterId, using, grantedBy, params } = msg;
  // TODO allow casting as player or team -- for now assuming entity
  if (casterType !== 'entity') {
    return 'Invalid caster type. Only Entity currently supported.';
  }
  // Make sure the client exists
  const player = players.get(clientId);
  if (player === undefined) {
    return 'Client/Player not found.';
  }
  // Make sure the casting entity exists
  const entity = getEntity(casterId);
  if (entity === undefined) {
    return 'Entity not found.';
  }
  // Make sure the player owns the casting entity
  if (!player.owns(entity)) {
    return 'You do not have ownership of that entity';
  }
  const event = entity.cast(msg.abilityName, { using, grantedBy, params });
  if (event === undefined) {
    return 'Could not cast.';
  }
}

export function addWorld(world: World): boolean {
  worlds.set(world.id, world);
  return true;
}

export function getWorld(id: string): World | undefined {
  return worlds.get(id);
}

export function getEntity(id: string): Entity | undefined {
  return entities.get(id);
}

export function getComponent(id: string): Component | undefined {
  return allComponents.get(id);
}

export function addEntity(e: Entity): boolean {
  entities.set(e.id, e);
  if (e.world && worlds.has(e.world.id)) {
    e.world.addEntity(e);
  }
  return true;
}

export function removeEntity(e: Entity): boolean {
  entities.delete(e.id);
  return true;
}

export function addAdmin(admin: Client) {
  adminClients.set(admin.id, admin);
}

export function removeAdmin(admin: Client | string) {
  const id = admin instanceof Object ? admin.id : admin;
  adminClients.delete(id);
}

export function addPlayer(player: Player) {
  players.set(player.id, player);
}

export function removePlayer(player: Player | string) {
  const id = player instanceof Player ? player.id : player;
  players.delete(id);
}

export function getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
  return undefined;
}

export function attach(c: Component): boolean {
  components.addComponent(c);
  return true;
}

export function detach(c: Component): void {
  components.removeComponent(c);
}

export async function* handle(phase: string, action: Action): EffectGenerator {
  yield* components.handle(phase, action);
}

export function sense(a: Action): boolean {
  return true;
}

export function senseEntity(e: Entity): boolean {
  return true;
}

// Optionally modify underlying serialized method to customize it for a team or player.
// Return undefined if no modification is necessary
export function percieve(a: Action, viewer: Player | Team, visibility: VisibilityType): string | undefined {
  return undefined;
}

export function serializeForScope(viewer: Viewer): SerializedForClient {
  const serialized: SerializedForClient = {
    id, // game id
    players: [],
    teams: [],
    worlds: [],
    entities: [],
    worldData: {}
  };
  // Serialize all players
  for (const player of players.values()) {
    serialized.players.push(player.serializeForClient());
  }
  // Serialize all teams
  for (const team of teams.values()) {
    serialized.teams.push(team.serializeForClient());
  }
  // Gather all visible worlds and serialize with visible baselayer chunks
  // TODO SCOPE -- I have to track visible worlds in their own nested set, for NOW this is acceptable
  const worldIds = new Set<string>();
  for (const worldChunk of viewer.visibleChunks.set) {
    const [id, x, y] = worldChunk.split('_');
    if (id !== undefined) {
      worldIds.add(id);
      const world = getWorld(id);
      if (world === undefined) {
        throw new Error(`Could not find work id ${id} when serializing chunk ${x} ${y} for client.`);
      }
      serialized.worldData[id] ??= [];
      // yeesh
      serialized.worldData[id].push({
        x: parseInt(x),
        y: parseInt(y),
        data: world.serializeChunk(parseInt(x), parseInt(y))
      });
    }
  }
  for (const worldId of worldIds) {
    const world = worlds.get(worldId)?.serializeForClient();
    if (world !== undefined) {
      serialized.worlds.push(world);
    }
  }
  // Gather all entities in sight
  const visibleEntities = viewer.getSensedAndOwnedEntities();
  for (const [, entity] of visibleEntities) {
    serialized.entities.push(entity.serializeForClient());
  }
  return serialized;
}

export function serializeForAdmin(): SerializedForClient {
  // TODO consider scope in what we serialize
  const serialized: SerializedForClient = {
    id, // game id
    players: [],
    teams: [],
    worlds: [],
    entities: [],
    worldData: {}
  };
  // Serialize all players
  for (const player of players.values()) {
    serialized.players.push(player.serializeForClient());
  }
  // Serialize all teams
  for (const team of teams.values()) {
    serialized.teams.push(team.serializeForClient());
  }
  // Serialize all worlds
  for (const world of worlds.values()) {
    // Serialize world itself
    serialized.worlds.push(world.serializeForClient());
    // Serialize ALL world data for admins
    serialized.worldData[world.id] ??= [];
    for (const chunkString of world.visibleChunks.set) {
      const [id, x, y] = chunkString.split('_');
      if (id && x && y) {
        serialized.worldData[id].push({
          x: parseInt(x),
          y: parseInt(y),
          data: world.serializeChunk(parseInt(x), parseInt(y))
        });
      }
    }
  }
  // Serialize all entities
  for (const [, entity] of entities) {
    serialized.entities.push(entity.serializeForClient());
  }

  return serialized;
}

// tslint:disable-next-line: no-namespace
export interface SerializedForClient {
  id: string;
  // config?: any,  // TODO make config interface, GameConfiguration.ts or something
  players: Player.SerializedForClient[];
  teams: Team.SerializedForClient[];
  worlds: World.SerializedForClient[];
  worldData: {
    [key: string]: {
      x: number;
      y: number;
      data: { base: any; [key: string]: any };
    }[];
  };
  entities: Entity.SerializedForClient[];
}

export function DeserializeAsClient(serialized: SerializedForClient, clientPlayerId?: string) {
  for (const team of serialized.teams) {
    const deserialized = Team.DeserializeAsClient(team);
    teams.set(deserialized.id, deserialized); // TODO addTeam
  }
  for (const world of serialized.worlds) {
    const deserialized = World.deserializeAsClient(world);
    addWorld(deserialized);
    // Load chunk data
    const chunks = serialized.worldData[deserialized.id];
    if (chunks !== undefined) {
      for (const chunk of chunks) {
        deserialized.deserializeChunk(new Vector(chunk.x, chunk.y), chunk.data);
      }
    }
  }
  for (const entity of serialized.entities) {
    const deserialized = Entity.DeserializeAsClient(entity);
    addEntity(deserialized);
    if (deserialized.world !== undefined) {
      deserialized._publish(deserialized.world, deserialized.position);
    }
  }
  for (const player of serialized.players) {
    const isOwner = player.id === clientPlayerId;
    const deserialized = Player.DeserializeAsClient(player, isOwner);
    addPlayer(deserialized);
  }
}
