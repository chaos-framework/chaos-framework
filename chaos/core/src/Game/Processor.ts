import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';
import {
  Action,
  BroadcastType,
  Chaos,
  Player,
  Team,
  Viewer,
  UnpublishEntityAction,
  EffectRunner,
  ProcessEffectGenerator,
  EffectGenerator
} from '../internal.js';
import { sleep } from '../Util/Sleep.js';

type processReturn = {
  result?: any;
  actions: Action[];
};

export async function processRunner(
  item: EffectRunner | ProcessEffectGenerator,
  broadcast = false
): Promise<processReturn> {
  // Keep a running queue of immediate + followup actions
  const immediates = new Stack<[EffectRunner, ProcessEffectGenerator]>();
  const followups = new Queue<EffectRunner>();

  // Ensure we can store the first generator's result value
  let result;
  let firstActionCompleted = false;

  // Keep track of all actions that happen, and also since the last delay if any
  const actionsThisProcess: Action[] = [];
  let actionsThisProcessAfterDelays: Action[] = [];

  let currentActionOrEvent: EffectRunner;
  let currentGenerator: ProcessEffectGenerator;

  // See if an action was passed in and convert it to an IMMEDIATE effect, otherwise take as-is
  if ((item as EffectRunner).run === undefined) {
    currentActionOrEvent = {
      run: async function* (force: boolean = false): EffectGenerator {}
    };
    currentGenerator = item as ProcessEffectGenerator;
  } else {
    currentActionOrEvent = item as EffectRunner;
    currentGenerator = currentActionOrEvent.run() as ProcessEffectGenerator;
  }

  // Loop through the first action and all reactions, followups, and delays
  while (currentActionOrEvent !== undefined) {
    let next = await currentGenerator.next();
    // Handle whatever effect
    while (next.done === false) {
      const effect = next.value;
      switch (effect[0]) {
        case 'IMMEDIATE':
          const [, actionOrEvent] = effect;
          // Cache the in-progress action+generator for later, and immediately start running the next
          // TODO check for length of reactions stack and ignore if too deep?
          immediates.push([currentActionOrEvent, currentGenerator]);
          currentActionOrEvent = actionOrEvent;
          currentGenerator = actionOrEvent.run() as ProcessEffectGenerator;
          break;
        case 'FOLLOWUP':
          followups.enqueue(effect[1]);
          break;
        case 'DELAY':
          const delay = effect[1];
          const start = Date.now();
          if (broadcast === true) {
            broadcastToExecutionHooks(actionsThisProcessAfterDelays);
            actionsThisProcessAfterDelays = [];
          }
          sendData();
          const timePassedWhileBroadcasting = Date.now() - start;
          if (timePassedWhileBroadcasting < delay) {
            await sleep(delay - timePassedWhileBroadcasting);
          }
          break;
      }
      next = await currentGenerator.next();
    }

    // Cache the result, if any
    if (!firstActionCompleted) {
      result ??= next.value;
      firstActionCompleted = true;
    }

    // Track that this action was finished applying and broadcast to hooks that want to read it immediately
    if (currentActionOrEvent instanceof Action) {
      actionsThisProcess.push(currentActionOrEvent);
      actionsThisProcessAfterDelays.push(currentActionOrEvent);
      if (broadcast === true) {
        broadcastToActionHooks(currentActionOrEvent);
        queueForBroadcast(currentActionOrEvent);
      }
    }

    // TODO tie queue of actions together here -- in other words let each action know what it actually followed
    // Pop last generator-in-progress OR next followup's generator
    if (immediates.length > 0) {
      [currentActionOrEvent, currentGenerator] = immediates.pop();
    } else {
      currentActionOrEvent = followups.dequeue();
      currentGenerator = currentActionOrEvent?.run() as ProcessEffectGenerator;
    }
  }

  if (broadcast === true) {
    broadcastToExecutionHooks(actionsThisProcessAfterDelays);
  }

  sendData();
  return { result, actions: actionsThisProcess };
}

function broadcastToActionHooks(action: Action) {
  for (const hook of Chaos.actionHooks) {
    hook(action);
  }
}

function broadcastToExecutionHooks(actionsThisProcess: Action[]) {
  for (const hook of Chaos.executionHooks) {
    hook(actionsThisProcess);
  }
}

function queueForBroadcast(action: Action, to?: Player | Team) {
  // TODO ADMIN much easier to push new chunks at game-level
  // Check if this message needs to be broadcasted to clients at all
  if (action.broadcastType === BroadcastType.NONE) {
    return;
  } else if (action.broadcastType === BroadcastType.DIRECT) {
    return;
  }
  // Broadcast to all admins
  for (const [, admin] of Chaos.adminClients) {
    admin.broadcastQueue.enqueue(action);
  }
  // Broadcast to everyone, if specified, or more specific clients
  if (action.broadcastType === BroadcastType.FULL) {
    for (const [, player] of Chaos.players) {
      player.queueForBroadcast(action);
    }
  } else {
    // Broadcast out to either visibility type based on sense of relevent entities
    if (Chaos.perceptionGrouping === 'team') {
      for (const [, team] of Chaos.teams) {
        if (
          (action.target &&
            (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
          (action.caster &&
            (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
        ) {
          team.queueForBroadcast(action);
        }
      }
      // TODO players without teams
    } else {
      for (const [, player] of Chaos.players) {
        if (
          (action.target &&
            (player.entities.has(action.target.id) || player.sensedEntities.has(action.target.id))) ||
          (action.caster &&
            (player.entities.has(action.caster.id) || player.sensedEntities.has(action.caster.id)))
        ) {
          const newChunks = action.chunkVisibilityChanges?.added['player']?.[player.id];
          if (newChunks !== undefined) {
            publishChunks(newChunks, player);
          }
          const newEntities = action.entityVisibilityChanges?.added['player']?.[player.id];
          if (newEntities !== undefined) {
            publishEntities(newEntities, player);
          }
          player.queueForBroadcast(action);
          const oldChunks = action.chunkVisibilityChanges?.removed['player']?.[player.id];
          if (oldChunks !== undefined) {
            unpublishChunks(oldChunks, player);
          }
          const oldEntities = action.entityVisibilityChanges?.removed['player']?.[player.id];
          if (oldEntities !== undefined) {
            unpublishEntities(oldEntities, player);
          }
        }
      }
    }
  }
  return;
}

function publishChunks(chunks: Set<string>, to: Viewer) {
  for (const chunk of chunks) {
    const [worldId, x, y] = chunk.split('_');
    if (!worldId || !x || !y) {
      throw new Error(`publishChunks failed -- invalid string ${chunk}`);
    }
    const world = Chaos.getWorld(worldId);
    if (world === undefined) {
      throw new Error(`publishChunks failed -- could not find world ${worldId}`);
    }
    world;
  }
}

function unpublishChunks(changes: Set<string>, from: Viewer) {}

function publishEntities(entities: Set<string>, to: Viewer) {
  for (const id of entities) {
    to.queueForBroadcast(Chaos.getEntity(id)!.getPublishedInPlaceAction());
  }
}

function unpublishEntities(entities: Set<string>, from: Viewer) {
  for (const id of entities) {
    from.queueForBroadcast(new UnpublishEntityAction({ target: Chaos.getEntity(id)! }));
  }
}

function sendData() {
  for (const [, player] of Chaos.players) {
    player.broadcast();
  }
  for (const [, admin] of Chaos.adminClients) {
    admin.broadcastEnqueued();
  }
}
