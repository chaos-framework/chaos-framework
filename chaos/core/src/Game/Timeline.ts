import { List } from 'simple-double-linked-list';
import { Action, Chaos, EventBegin, EventEnd } from '../internal.js';
import { ListNode } from 'simple-double-linked-list/dist/src/listNode.js';
import { Stack } from 'stack-typescript';

export type TimelineActionHandle = {
  id: string,
  depth: number,
  parentId?: string,
  action?: Action, // action could be undefined for a few reasons
  children?: TimelineActionHandle[]
}

export class Timeline {
  // Whether or not the timeline is set to play automatically
  paused: boolean = false;
  // Whether or not the timeline is actively playing (looping through iterator) right now
  processing: boolean = false;

  // Double linked list of all actions
  private actions: List<Action>;
  // Permanent iterator representing "now"
  private iterator!: ReturnType<List<Action>['Begin']>;

  // Stack of running EventBegins (undefined in case of events started before connection)
  eventStack: Stack<EventBegin | undefined> = new Stack<EventBegin | undefined>();
  // Map to each action's list node
  nodeByActionId = new Map<String, ListNode<Action>>();

  // Nested array of actions and events
  nestedTimeline: TimelineActionHandle[] = []; 
  // Map to each TimelineActionHandle by ID
  actionsById: Map<string, TimelineActionHandle> = new Map<string, TimelineActionHandle>(); 

  constructor() {
    this.actions = new List<Action>();
    this.iterator = this.actions.Begin();
  }

  // Play until the most recent action
  async play({
    instant = false,
    to,
    forwards = true
  }: { instant?: boolean; to?: Action; forwards?: boolean } = {}) {
    // Dont bother playing if this function is already running
    if (this.processing || this.paused) {
      return;
    }

    // Indicate that this function is currently running
    this.processing = true;

    if (this.iterator.IsAtEnd()) {
      this.iterator = this.actions.End();
    }

    try {
      while (!this.iterator.IsAtEnd() && !this.paused) {
        const action = this.iterator.GetCurrentNode().value;

        // See if this is the an EventBegin and add it to the stack, if so
        if (action instanceof EventBegin) {
          this.eventStack.push(action);
        } else if (action instanceof EventEnd) {
          // TODO handle EventEnd further up the stack, ie due to 
          if (this.eventStack.tail?.id === action.beginningId) {
            this.eventStack.pop();
          }
        }

        if (!this.nodeByActionId.has(action.id)) {
          this.nodeByActionId.set(action.id, this.iterator.GetCurrentNode());
        }
        const generator = action.apply();
        for (const hook of Chaos.actionHooks) {
          hook(action);
        }
        for (const hook of Chaos.executionHooks) {
          hook([action]);
        }
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
        this.iterator.Next();
      }
    } catch (error) {
      console.error((error as unknown as Error).message);
      this.processing = false;
      this.paused = true;
    }

    // Indicate that this function is complete
    this.processing = false;
  }

  // Stop current and future playback
  pause() {
    this.paused = true;
  }

  // Resume playback
  unpause() {
    this.paused = false;
    if (!this.processing) {
      this.play();
    }
  }

  // Rewind until a specific action is reached
  async rewindTo(action: Action) {}

  // Play until a specific action is reached
  async playTo(action: Action) {}

  // Add new actions onto the end of the timeline and play if not paused
  add(action: Action): void;
  add(actions: Action[]): void;
  async add(actions: Action | Action[]) {
    if (Array.isArray(actions)) {
      for (const action of actions) {
        this.actions.AddFront(action);
        this.addActionToMap(action);
      }
    } else {
      this.actions.AddFront(actions);
      this.addActionToMap(actions);
    }

    // If the current iterator is finished, then set it to the new end before playing
    if (this.iterator.IsAtEnd()) {
      this.iterator = this.actions.End();
    }

    this.play();
  }

  // Add actions to the map as they come in
  addActionToMap(action: Action): void {
    const { id } = action;

  }

}
