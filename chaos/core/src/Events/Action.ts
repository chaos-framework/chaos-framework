import {
  Chaos,
  ActionType,
  Entity,
  Component,
  Event,
  ComponentContainer,
  BroadcastType,
  World,
  Permission,
  SensoryInformation,
  NestedChanges,
  Viewer,
  Vector,
  Printable,
  TerminalMessageFragment,
  TerminalMessage,
  NestedSetChanges,
  Followup,
  processRunner,
  Effect,
  EffectGenerator,
  EffectRunner,
  Immediate,
  ProcessEffectKey,
  Permit,
  Deny,
  Delay,
  ProcessEffectGenerator,
  chaosUniqueId
} from '../internal.js';

export type Update = { path: string; value: any; predicate?: any };

export abstract class Action<
  TargetType extends ComponentContainer = ComponentContainer,
  CasterType extends ComponentContainer = ComponentContainer
> implements EffectRunner
{
  id!: string;

  actionType: ActionType = ActionType.INVALID;
  broadcastType: BroadcastType = BroadcastType.FULL;

  terminalMessage?: TerminalMessage | ((action: Action) => TerminalMessage);
  generatedMessage?: TerminalMessage;
  verb?: string;

  caster?: CasterType;
  target?: TargetType;
  using?: Entity | Component<ComponentContainer>;

  metadata = new Map<string, string | number | boolean | undefined>();
  breadcrumbs: Set<string> = new Set<string>();

  public: boolean = false; // whether or not nearby entities (who are not omnipotent) can modify/react

  // TODO below doesn't actually stop developer from adding redundant before or after..
  static prePhases: Exclude<string[], 'before'> = ['permit', 'modify'];
  static postPhases: Exclude<string[], 'after'> = ['react'];

  getPrePhases(): string[] {
    return (this.constructor as any).prePhases || [];
  }

  getPostPhases(): string[] {
    return (this.constructor as any).postPhases || [];
  }

  skipPrePhases: boolean = false; // whether or not to run pre-phases
  skipPostPhases: boolean = false; // whether or not to run post-phases

  permissions: Map<number, Permission> = new Map<number, Permission>();
  permitted: boolean = true;
  applied: boolean = false;
  decidingPermission?: Permission;

  nested: number = 0;

  movementAction: boolean = false; // whether the action involves movement, and therefore possible scope / visibility change

  anticipators = new Set<string>();
  sensors = new Map<string, SensoryInformation | boolean>();

  entityVisibilityChanges?: NestedChanges;
  chunkVisibilityChanges?: NestedSetChanges;

  listeners = new Map<string, ComponentContainer>();

  // Additional worlds and points that entities in a radius around can be included.
  additionalListenPoints: { world: World; position: Vector }[] = [];
  // Additional listeners on top of the default caster -> target flow
  additionalListeners: ComponentContainer[] = [];

  followups: (Action | Event)[] = [];
  reactions: (Action | Event)[] = [];
  parent?: Action | Event;

  // Function to run to check if the action is still feasible after any modifiers / counters etc
  feasabilityCallback?: (a?: Action) => boolean;

  static universallyRequiredFields: string[] = ['tags', 'breadcrumbs', 'permitted'];

  constructor({ id, caster, target, using, metadata, message }: ActionParameters<TargetType, CasterType> = {}) {
    this.id = id || chaosUniqueId();
    this.caster = caster;
    this.target = target;
    this.using = using;
    this.permissions.set(0, new Permission(true));
    this.terminalMessage = message;
    // tslint:disable-next-line: forin
    for (const key in metadata) {
      this.metadata.set(key, metadata[key]);
    }
  }

  // Upon execution this action will apply itself and broadcast -- no phases called
  direct(): Action<TargetType, CasterType> {
    this.skipPrePhases = true;
    this.skipPostPhases = true;
    return this;
  }

  // Set the optional callback to see if the action is still possible
  if(callback: (a?: Action) => boolean): Action<TargetType, CasterType> {
    this.feasabilityCallback = callback;
    return this;
  }

  withMessage(...items: (string | Printable | TerminalMessageFragment | undefined)[]) {
    this.terminalMessage = new TerminalMessage(...items);
    return this;
  }

  async *run(force: boolean = false): EffectGenerator {
    this.initialize();

    // Get listeners (nearby entities, worlds, systems, etc)
    this.collectListeners();

    // Assume that caster has full awareness
    if (this.caster) {
      this.sensors.set(this.caster.id, true);
    }

    // Handle all pre-phases
    if (!this.skipPrePhases) {
      for (const phase of ['before', ...this.getPrePhases()]) {
        for (const [, listener] of this.listeners) {
          yield* listener.handle(phase, this);
        }
      }
    }

    // See if the action is allowed after any modifiers
    this.decidePermission();

    // Apply this action to the target, checking for permission and if still feasible
    if (
      (this.permitted && this.feasabilityCallback !== undefined ? this.feasabilityCallback(this) : true) ||
      force
    ) {
      yield* this.apply();
    }

    // Generate terminal message
    this.generateMessage();

    // Handle all post-phases
    if (!this.skipPostPhases) {
      for (const phase of [...this.getPostPhases(), 'after']) {
        for (const [, listener] of this.listeners) {
          yield* listener.handle(phase, this);
        }
      }
    }

    this.teardown();

    return this.applied;
  }

  // Runs this action internally, without broadcasting to any clients. Useful for entity factories or game initialization.
  async runPrivate() {
    await processRunner(this, false);
  }

  // Runs processEffect on all yielded results of this action
  async *process(): EffectGenerator {
    const generator = this.apply();
    let next = await generator.next();
    // Handle
    while (next.done === false) {
      const effect = next.value;
      const result = this.processEffect(effect);
      next = await generator.next();
    }
  }

  /**
   * Logic for effect handling within actions. Handles permission effects by default, but can be
   * overriden for custom action-specific effects. Just make sure to return `super(effect)` at the end
   * if the override doesn't actually handle the effect passed in.
   */
  processEffect(effect: Effect): Effect | undefined {
    const [effectType] = effect;
    switch (effectType) {
      case 'PERMIT':
        this.addPermission(true, effect[1]);
        break;
      case 'DENY':
        this.addPermission(false, effect[1]);
        break;
      default:
        return undefined;
    }
  }

  addListener(listener: ComponentContainer) {
    if (!this.listeners.has(listener.id)) {
      this.listeners.set(listener.id, listener);
    }
  }

  collectListeners() {
    const listenRadius = Chaos.listenDistance;

    const { caster, target } = this;

    // Add the caster, caster's world, player, teams, and nearby entities (if caster specified)
    if (caster !== undefined) {
      this.addListener(caster);
      if (caster instanceof Entity) {
        // Add all nearby entities and the world itself, if caster is published to a world
        if (caster.world !== undefined) {
          caster.world.getEntitiesWithinRadius(caster.position, listenRadius).map((entity) => {
            if (entity.id !== caster.id && entity.id !== target?.id) {
              this.addListener(entity);
            }
          });
          this.addListener(caster.world);
        }

        // Add all players that own this entity
        for (const [, player] of caster.players) {
          this.addListener(player);
        }

        // Add all teams that this entity belongs to
        if (caster.team !== undefined) {
          this.addListener(caster.team);
        }
      }
    }

    // TODO add players + teams of caster

    // Add the game itself :D
    this.addListener(Chaos.reference);

    // TODO add players + teams of target(s)

    // Add the target world, nearby entities, and target itself.. if the target !== the caster
    if (target !== undefined && (target as any) !== caster) {
      this.addListener(target);
      if (target instanceof Entity) {
        // Add nearby entities and the world itself
        if (target.world !== undefined) {
          target.world.getEntitiesWithinRadius(target.position, listenRadius).forEach((entity) => {
            this.addListener(entity);
          });
          this.addListener(target.world);
        }

        // Add all players that own this entity
        for (const [, player] of target.players) {
          this.addListener(player);
        }

        // Add all teams that this entity belongs to
        if (target.team !== undefined) {
          this.addListener(target.team);
        }
      }
    }

    // Let worlds and entities listen in any additional radiuses specified by the action
    this.additionalListenPoints.map((point) => {
      this.addListener(point.world);
      point.world.getEntitiesWithinRadius(point.position, listenRadius).forEach((entity) => {
        this.addListener(entity);
      });
    });

    // Add any additional listeners specified by the action
    this.additionalListeners.map((listener) => this.addListener(listener));
  }

  deniedByDefault() {
    this.addPermission(false);
    return this;
  }

  addPermission(
    permitted: boolean,
    {
      priority = 0,
      by,
      using,
      message
    }: {
      priority?: number;
      by?: Entity | Component;
      using?: Entity | Component;
      message?: string;
    } = {}
  ) {
    const previous = this.permissions.get(priority);
    if (previous === undefined) {
      // Add directly if this has never been added
      this.permissions.set(priority, new Permission(permitted, { by, using, message }));
    } else {
      // Override the previous at this priority if the new one is a denial and the previous is an allowance
      if (previous.permitted && !permitted) {
        this.permissions.set(priority, new Permission(permitted, { by, using, message }));
      }
    }
  }

  decidePermission() {
    // Find the highest ranked allow/forbid
    let highest = 0;
    for (const [key, value] of this.permissions) {
      if (key >= highest) {
        highest = key;
        this.decidingPermission = value;
        this.permitted = value.permitted;
      }
    }
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

  sense(entity: Entity, information: SensoryInformation | boolean) {}

  static immediate(action: Action): Immediate {
    return ['IMMEDIATE', action];
  }

  react(reaction: Action | Event): Immediate {
    if (reaction instanceof Action) {
      reaction.parent = this;
    }
    return ['IMMEDIATE', reaction];
  }

  followup(followup: Action | Event): Followup {
    if (followup instanceof Action) {
      followup.parent = this;
    }
    return ['FOLLOWUP', followup];
  }

  /**
   * Returns a `Delay` effect for the number of milliseconds specified. Delay does
   * not run other actions asynchronously, but broadcasts actions up to this point
   * and waits before process any other actions. Note that in case of a low enough
   * `millisecond` count with a large enough backlog of actions to serialize and
   * broadcast out, there is a chance that the delay in real-time will be greater
   * than the number of `milliseconds` specified.
   * @param milliseconds The time (in milliseconds) to delay for. Must be `>= 0`.
   * @returns
   */
  delay(milliseconds: number): Delay {
    if (milliseconds < 0) {
      // TODO make this more specific
      throw new Error();
    }
    return ['DELAY', milliseconds];
  }

  permit(priority: number = 0, args?: Omit<Permit[1], 'priority'>): Permit {
    return ['PERMIT', { ...args, priority }];
  }

  deny(priority: number = 0, args?: Omit<Permit[1], 'priority'>): Deny {
    return ['DENY', { ...args, priority }];
  }

  asEffect(): Immediate {
    return ['IMMEDIATE', this];
  }

  static serializedHasRequiredFields(json: any, additional: string[]): boolean {
    for (const key of this.universallyRequiredFields) {
      if (!json[key]) {
        return false;
      }
    }
    for (const key of additional) {
      if (!json[key]) {
        return false;
      }
    }
    return true;
  }

  static deserializeCommonFields(json: Action.Serialized): Action.Deserialized {
    const caster: Entity | undefined = json.caster ? Chaos.getEntity(json.caster) : undefined;
    const target: Entity | undefined = json.target ? Chaos.getEntity(json.target) : undefined;
    const using: Entity | undefined = json.using ? Chaos.getEntity(json.using) : undefined;
    const metadata = json.metadata;
    const permitted = json.permitted;
    if (json.message !== undefined) {
      const message = TerminalMessage.deserialize(json.message);
    }
    return { id: json.id, caster, target, using, metadata, permitted };
  }

  abstract apply(): ProcessEffectGenerator;

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    return true; // SCOPE
  }

  // Get the relevant entity, by default the target but some actions apply to an entity that is not the target
  getEntity(): Entity | undefined {
    if (this.target instanceof Entity) {
      return this.target;
    }
  }

  serialize(): Action.Serialized {
    return {
      id: this.id,
      caster: this.caster?.id,
      target: this.target?.id,
      using: this.using?.id,
      // tags: Array.from(this.tags),
      permitted: this.permitted,
      actionType: this.actionType,
      message: this.generatedMessage?.serialize()
    };
  }

  generateMessage(): void {
    // Run the callback to generate a message
    if (this.terminalMessage !== undefined) {
      if (!(this.terminalMessage instanceof TerminalMessage)) {
        this.terminalMessage = this.terminalMessage(this);
      }
      this.generatedMessage = this.terminalMessage;
    }
  }

  initialize(): void {}
  teardown(): void {}

  getSubscriptionAddressesAndValues(): Update[] { return []; }
}

// tslint:disable-next-line: no-namespace
export namespace Action {
  export interface Serialized {
    id: string;
    caster?: string;
    target?: any;
    using?: string;
    metadata?: { [key: string]: string | number | boolean | undefined };
    permitted: boolean;
    actionType: ActionType;
    message?: TerminalMessage.Serialized;
    originId?: string;
    originType?: 'react' | 'followup';
  }

  export interface Deserialized {
    id: string;
    caster?: Entity;
    target?: Entity;
    using?: Entity;
    metadata?: { [key: string]: string | number | boolean | undefined };
    permitted: boolean;
    message?: TerminalMessage;
    originId?: string;
    originType?: 'react' | 'followup';
  }
}

export interface ActionParameters<
  TargetType extends ComponentContainer = ComponentContainer,
  CasterType extends ComponentContainer = ComponentContainer
> {
  id?: string;
  caster?: CasterType;
  target?: TargetType;
  using?: Entity | Component;
  metadata?: { [key: string]: string | number | boolean | undefined };
  message?: TerminalMessage
}
