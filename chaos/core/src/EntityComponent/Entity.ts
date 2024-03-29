import {
  Chaos,
  Vector,
  World,
  CachesSensedEntities,
  Printable,
  Component,
  ComponentContainer,
  ComponentCatalog,
  Event,
  Action,
  Ability,
  Property,
  AttachComponentAction,
  ChangeWorldAction,
  MoveAction,
  PublishEntityAction,
  UnpublishEntityAction,
  AddSlotAction,
  RemoveSlotAction,
  AddPropertyAction,
  OptionalCastParameters,
  Grant,
  RemovePropertyAction,
  LearnAbilityAction,
  NestedChanges,
  ForgetAbilityAction,
  EquipItemAction,
  Scope,
  SenseEntityAction,
  NestedMap,
  Team,
  DetachComponentAction,
  Player,
  cachesSensedEntities,
  GlyphCode347,
  NestedSet,
  NestedSetChanges,
  chaosUniqueId,
  Effect,
  EffectGenerator
} from '../internal.js';

export class Entity<A extends readonly string[] = readonly string[], C extends Component[] = Component[]>
  implements ComponentContainer, Printable
{
  readonly id: string;
  name: string;
  metadata = new Map<string, string | number | boolean | undefined>();
  published = false;
  active = false;
  perceives = false; // when assigned to a player/team it contributes to visibility
  omnipotent = false; // listens to every action in the game

  properties: Map<string, Property>; // = new Map<string, Property>();

  components: ComponentCatalog<C> = new ComponentCatalog<C>(this); // all components

  abilities: Map<string, Grant[]> = new Map<string, Grant[]>();

  players = new Map<string, Player>(); // players that can control this Entity
  team?: Team; // team that this entity belongs to

  sensedEntities: NestedMap<Entity>;
  visibleChunks: NestedSet;

  // Places for items to be equipped
  slots: Map<string, Entity | undefined> = new Map<string, Entity | undefined>();
  // TODO Inventory array -- places for items to be stored -- probably needs to be a class to store size info

  world?: World;
  position: Vector = new Vector(0, 0);

  asset?: string;
  glyph: GlyphCode347;

  constructor(
    {
      id = chaosUniqueId(),
      name = 'Unnamed Entity',
      metadata,
      team,
      active = false,
      omnipotent = false,
      glyph = GlyphCode347['?'],
      permanentComponents = [] as Component[] as C
    }: {
      id?: string;
      name?: string;
      team?: Team;
      metadata?: { [key: string]: string | number | boolean | undefined };
      active?: boolean;
      omnipotent?: boolean;
      glyph?: GlyphCode347;
      permanentComponents?: C;
    } = { permanentComponents: [] as Component[] as C }
  ) {
    this.id = id;
    this.name = name;
    this.active = active;
    this.omnipotent = omnipotent;
    this.glyph = glyph;
    // tslint:disable-next-line: forin
    for (const key in metadata) {
      this.metadata.set(key, metadata[key]);
    }
    this.visibleChunks = new NestedSet(id, 'entity');
    this.sensedEntities = new NestedMap<Entity>(id, 'entity');
    if (team) {
      this.team = team;
      team._addEntity(this);
    }
    this.properties = new Map<string, Property>();
    this._attachAll(permanentComponents);
  }

  print(): string {
    return this.name == '' ? '???': this.name;
  }

  activate() {
    this.active = true;
    // TODO attach listeners?
  }

  deactivate() {
    this.active = false;
    // TODO remove listeners?
  }

  // MESSAGING

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    switch (scope) {
      case 'entity':
        return this;
      case 'world':
        return this.world;
      case 'game':
        return Chaos.reference;
      default:
        return undefined;
    }
  }

  async *handle(phase: string, action: Action): EffectGenerator {
    yield* this.components.handle(phase, action);
  }

  getProperty(name: A[number]): Property;
  getProperty(name: string): Property | undefined;
  getProperty(name: string | A[number]): Property | undefined {
    return this.properties.get(name);
  }

  tag(tag: string) {
    if (!this.metadata.has(tag)) {
      this.metadata.set(tag, true);
    }
  }

  untag(tag: string) {
    this.metadata.delete(tag);
  }

  tagged(tag: string): boolean {
    return this.metadata.has(tag);
  }

  is(componentName: string): boolean {
    return this.components.is(componentName);
  }

  has(componentName: string): boolean {
    return this.components.has(componentName);
  }

  // TODO "all" method to get all components of a type

  can(ability: string): boolean {
    return this.abilities.has(ability);
  }

  // Cast ability by name and optional lookup for specific version based on how we're casting it
  cast(
    abilityName: string,
    { using, grantedBy, target, params }: OptionalCastParameters = {}
  ): Event | string | undefined {
    // See if we have this ability at all
    const grants = this.abilities.get(abilityName);
    if (grants && grants.length > 0) {
      // Use the verion of this ability granted by
      let grant: Grant | undefined = using
        ? grants.find((g) => g.using === using && g.grantedBy === grantedBy)
        : undefined;
      if (!grant) grant = grants[0];
      const e = grant.ability.cast(this, { using, target, params });
      return e;
    }
    return undefined;
  }

  getTeam(): Team | undefined {
    return this.team;
  }

  /*****************************************
   *  ACTION GENERATORS / IMPLEMENTATIONS
   *****************************************/

  getPublishedInPlaceAction(): PublishEntityAction {
    if (this.published && this.world !== undefined) {
      return new PublishEntityAction({
        target: this,
        position: this.position,
        world: this.world
      });
    }
    throw new Error('Tried to publish an entity to a client is not published or does not have a world.');
  }

  // Publishing
  publish({
    caster,
    world,
    position,
    using,
    metadata
  }: PublishEntityAction.EntityParams): PublishEntityAction {
    return new PublishEntityAction({
      caster,
      target: this,
      world,
      position,
      using,
      metadata
    });
  }

  _publish(world: World, position: Vector, changes?: NestedSetChanges): boolean {
    if (this.published) {
      return false;
    }
    // Get the visibility changes for adding to the world, or alternatively the world will fail to add it
    const result = world.addEntity(this, changes);
    if (!result) {
      return false;
    }
    this.published = true;
    this.position = position;
    this.world = world;
    Chaos.addEntity(this);
    this.components.publish();
    return true;
  }

  // Unpublishing

  unpublish({ caster, using, metadata }: UnpublishEntityAction.EntityParams = {}): UnpublishEntityAction {
    return new UnpublishEntityAction({
      caster,
      target: this,
      using,
      metadata
    });
  }

  _unpublish(changes?: NestedSetChanges): boolean {
    if (this.world?.removeEntity(this, changes)) {
      Chaos.removeEntity(this);
      this.components.unpublish();
      // TODO and persistence stuff
      this._leaveTeam();
      for (const [id, player] of this.players) {
        this._revokeOwnershipFrom(player);
      }
      this.published = false;
      return true;
    }
    return false;
  }

  // Attaching components

  attach(
    { component, caster, using, metadata }: AttachComponentAction.EntityParams,
    force = false
  ): AttachComponentAction {
    return new AttachComponentAction({
      caster,
      target: this,
      component,
      using,
      metadata
    });
  }

  _attach(component: Component): boolean {
    if (this.published) {
      Chaos.allComponents.set(component.id, component);
    }
    this.components.addComponent(component); // TODO check for unique flag, or duplicate ID -- return false if already attached
    if (cachesSensedEntities(component)) {
      this.sensedEntities.addChild(component.sensedEntities);
    }
    component._publish();
    return true;
  }

  _attachAll(components: Component[]) {
    for (const component of components) {
      this._attach(component);
    }
  }

  // Detaching components

  detach(
    { component, caster, using, metadata }: DetachComponentAction.EntityParams,
    force = false
  ): DetachComponentAction {
    return new DetachComponentAction({
      caster,
      target: this,
      component,
      using,
      metadata
    });
  }

  _detach(component: Component): boolean {
    Chaos.allComponents.delete(component.id);
    this.components.removeComponent(component);
    if (cachesSensedEntities(component)) {
      this.sensedEntities.removeChild(component.id);
    }
    return true;
  }

  _detachAll(components: Component[]) {
    for (const component of components) {
      this._detach(component);
    }
  }

  // Adding properties

  addProperty(
    { caster, using, name, current, min, max, metadata }: AddPropertyAction.EntityParams,
    force = false
  ): AddPropertyAction {
    return new AddPropertyAction({
      caster,
      target: this,
      using,
      name,
      current,
      min,
      max,
      metadata
    });
  }

  _addProperty(name: string, current?: number, min?: number, max?: number): boolean {
    // Check that we don't already have this property
    if (this.properties.has(name)) {
      return false;
    } else {
      this.properties.set(name, new Property(this, name, current, min, max));
      return true;
    }
  }

  removeProperty({ caster, using, name, metadata }: RemovePropertyAction.EntityParams, force = false) {
    return new RemovePropertyAction({
      caster,
      target: this,
      using,
      name,
      metadata
    });
  }

  _removeProperty(name: string, p?: Property): boolean {
    // Check that we have this property
    if (!this.properties.has(name)) {
      return false;
    } else {
      this.properties.delete(name);
      // TODO unhook modifications on property values
      return true;
    }
  }

  // Learning abilities

  learn(
    { caster, using, ability, metadata }: LearnAbilityAction.EntityParams,
    force = false
  ): LearnAbilityAction {
    return new LearnAbilityAction({
      caster,
      target: this,
      using,
      ability,
      metadata
    });
  }

  _learn(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
    const { name } = ability;
    const grants = this.abilities.get(name);
    if (grants) {
      // check if ability already granted by this combo
      const duplicate = grants.find((grant) => grant.grantedBy === grantedBy && grant.using === using);
      if (!duplicate) {
        grants.push({ ability, grantedBy: grantedBy?.id, using: using?.id });
      } else {
        return false;
      }
    } else {
      this.abilities.set(name, [{ ability, grantedBy: grantedBy?.id, using: using?.id }]);
    }
    return true;
  }

  // Denying abilities

  forget(
    { caster, using, ability, metadata }: ForgetAbilityAction.Params,
    force = false
  ): ForgetAbilityAction {
    return new ForgetAbilityAction({
      caster,
      target: this,
      using,
      ability,
      metadata
    });
  }

  _forget(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
    const name = ability.name;
    let grants = this.abilities.get(name);
    if (!grants) {
      return false;
    }
    const grantIndex = grants.findIndex((grant) => grant.grantedBy === grantedBy && grant.using === using);
    if (grantIndex < 0) {
      return false;
    }

    grants.splice(grantIndex, 1);

    // Replace the array of grants for this ability, or delete if it's no longer granted by anything
    if (grants.length > 0) {
      this.abilities.set(name, grants);
    } else {
      this.abilities.delete(name);
    }

    return true;
  }

  // Equipping items

  equip({ caster, slot, item, metadata }: EquipItemAction.EntityParams, force = false): EquipItemAction {
    return new EquipItemAction({ caster, target: this, slot, item, metadata });
  }

  _equip(item: Entity, slotName: string): boolean {
    if (this.slots.has(slotName) && this.slots.get(slotName) === undefined) {
      this.slots.set(slotName, item);
      // TODO should item decide to remove from parent container?
      return true;
    }
    return false;
  }

  // Unequipping items
  // TODO

  // Slot changes

  addSlot({ caster, name, metadata }: AddSlotAction.EntityParams, force = false): AddSlotAction {
    return new AddSlotAction({ caster, target: this, name, metadata });
  }

  _addSlot(name: string): boolean {
    if (!this.slots.has(name)) {
      this.slots.set(name, undefined);
      return true;
    }
    return false;
  }

  removeSlot({ caster, name, metadata }: RemoveSlotAction.Params, force = false): RemoveSlotAction {
    return new RemoveSlotAction({ caster, target: this, name, metadata });
  }

  _removeSlot(name: string): boolean {
    if (this.slots.has(name)) {
      // TODO, have to drop item on the ground, or something
      this.slots.delete(name);
      return true;
    }
    return false;
  }

  // Movement

  move({ caster, to, using, metadata }: MoveAction.EntityParams): MoveAction {
    if (this.isPublished()) {
      return new MoveAction({ caster, target: this, to, using, metadata });
    }
    throw new Error('Tried to create move action for unpublished entity.');
  }

  moveRelative({ caster, amount, using, metadata }: MoveAction.EntityRelativeParams): MoveAction {
    if (this.isPublished()) {
      return new MoveAction({
        caster,
        target: this,
        to: this.position.copyAdjusted(amount.x, amount.y),
        using,
        metadata
      });
    }
    throw new Error('Tried to create move action for unpublished entity.');
  }

  _move(to: Vector, changes = new NestedSetChanges()): boolean {
    const { world } = this;
    if (world !== undefined) {
      // Let the world know we're moving and track the chunk load changes
      const couldMove = world.moveEntity(this, this.position, to, changes);
      if (couldMove) {
        this.position = to.copy();
        return true;
      } else {
        return false;
      }
    } else {
      this.position = to.copy();
      return true;
    }
  }

  // Senses

  senseEntity({ target, using, metadata }: SenseEntityAction.EntityParams): SenseEntityAction {
    return new SenseEntityAction({ caster: this, target, using, metadata });
  }

  _senseEntity(entity: Entity, using: CachesSensedEntities, changes?: NestedChanges) {
    using.sensedEntities.add(entity.id, entity, undefined, changes);
    return true;
  }

  loseEntity({ target, using, metadata }: SenseEntityAction.EntityParams): SenseEntityAction {
    return new SenseEntityAction({ caster: this, target, using, metadata });
  }

  _loseEntity(entity: Entity, from: CachesSensedEntities, changes?: NestedChanges): boolean {
    from.sensedEntities.remove(entity.id, 'undefined', changes);
    return true;
  }

  // World

  changeWorlds({ caster, to, position, using, metadata }: ChangeWorldAction.EntityParams): ChangeWorldAction {
    if (this.world === undefined) {
      throw new Error();
    }
    return new ChangeWorldAction({
      caster,
      target: this,
      from: this.world,
      to,
      position,
      using,
      metadata
    });
  }

  _changeWorlds(to: World, position: Vector, changes = new NestedSetChanges()): boolean {
    if (!to.isInBounds(position)) {
      return false;
    }
    if (this.world !== undefined) {
      if (!this.world.removeEntity(this, changes)) {
        return false;
      }
    }
    this.position = position;
    to.addEntity(this, changes);
    this.world = to;
    // TODO component catalog callback
    return true;
  }

  // Players
  // TODO action
  _grantOwnershipTo(player: Player) {
    if (!this.players.has(player.id)) {
      this.players.set(player.id, player);
      player._ownEntity(this);
    }
  }

  // TODO action
  _revokeOwnershipFrom(player: Player) {
    if (this.players.has(player.id)) {
      this.players.delete(player.id);
      player._disownEntity(this);
    }
  }

  // Teams
  // TODO action
  _joinTeam(team: Team): boolean {
    if (team !== undefined) {
      this.team = team;
      team._addEntity(this);
      return true;
    }
    return false;
  }

  // TODO action
  _leaveTeam() {
    if (this.team !== undefined) {
      this.team._removeEntity(this);
      this.team = undefined;
    }
  }

  // NARROWING
  isPublished(): this is PublishedEntity {
    return this.published && this.world !== undefined && this.position !== undefined;
  }

  isOnTeam(team?: Team): this is EntityOnTeam {
    return this.team !== undefined && (team === undefined || this.team === team);
  }

  // SERIALIZATION

  serialize(): Entity.Serialized {
    return { id: this.id };
  }

  serializeForClient(): Entity.SerializedForClient {
    const components: Component.SerializedForClient[] = [];
    this.components.all.forEach((c) => {
      if (c.broadcast) {
        components.push(c.serializeForClient());
      }
    });
    const properties: Property.SerializedForClient[] = [];
    for (const [name, property] of this.properties) {
      properties.push(property.serializeForClient());
    }
    return {
      id: this.id,
      position: this.position.serialize(),
      name: this.name,
      active: this.active,
      omnipotent: this.omnipotent,
      world: this.world?.id,
      components,
      glyph: this.glyph,
      team: this.team?.id,
      properties
    };
  }
}

// tslint:disable-next-line: no-namespace
export namespace Entity {
  export type ConstructorParams<T extends Component[]> = {
    id?: string;
    name?: string;
    team?: Team;
    metadata?: { [key: string]: string | number | boolean | undefined };
    active?: boolean;
    omnipotent?: boolean;
    glyph?: GlyphCode347;
    permanentComponents?: T;
  };

  export interface Serialized {}

  export interface SerializedForClient {
    id: string;
    name: string;
    position: string;
    world?: string;
    metadata?: { [key: string]: string | number | boolean | undefined };
    active?: boolean;
    omnipotent?: boolean;
    team?: string;
    components?: Component.SerializedForClient[];
    properties?: Property.SerializedForClient[];
    glyph?: GlyphCode347;
  }

  export function Deserialize(json: Entity.Serialized): Entity {
    throw new Error('Not yet implemented.');
  }

  export function DeserializeAsClient(json: Entity.SerializedForClient): Entity {
    try {
      const { id, name, metadata, team, active, omnipotent, components, world: worldId, glyph, properties } = json;
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
      if (worldId) {
        const world = Chaos.getWorld(worldId);
        if (world) {
          deserialized.world = world;
        }
      }
      if (team) {
        const t = Chaos.teams.get(team);
        if (t === undefined) {
          throw new Error(`Team for Entity ${id} is not defined locally.`);
        }
        deserialized.team = t;
      }
      if (components) {
        for (let c of components) {
          deserialized._attach(Component.DeserializeAsClient(c));
        }
      }
      if (properties) {
        for (const p of properties) {
          // TODO deserialize modifiers as well (maybe they need a refactor, first)
          deserialized._addProperty(p.name, p.current, p.min, p.max);
        }
      }
      return deserialized;
    } catch (error) {
      throw error;
    }
  }
}

// NARROWED TYPES

export type PublishedEntity = {
  published: true;
  world: World;
  position: Vector;
} & Entity;

export type EntityOnTeam = {
  team: Team;
} & PublishedEntity;
