import { List } from 'simple-double-linked-list';
import { Action, Chaos } from '../internal.js';

export class Timeline {
  // Double linked list of all actions
  private actions: List<Action>;
  // Permanent iterator representing "now"
  private iterator!: ReturnType<List<Action>['Begin']>;
  // Whether or not the timeline is set to play automatically
  paused: boolean = false;
  // Whether or not the timeline is actively playing (looping through iterator) right now
  processing: boolean = false;

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
      }
    } else {
      this.actions.AddFront(actions);
    }

    // If the current iterator is finished, then set it to the new end before playing
    if (this.iterator.IsAtEnd()) {
      this.iterator = this.actions.End();
    }

    this.play();
  }
}
