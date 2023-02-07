import { List } from 'simple-double-linked-list';
import { Action } from '../internal.js';

export class Timeline {
  // Double linked list of all actions
  private actions: List<Action>;
  // Permanent iterator representing "now"
  private iterator: ReturnType<List<Action>['Begin']>;
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
    this.paused = false;
    this.processing = true;
    try {
      while (!this.iterator.IsAtEnd() && !this.paused) {
        this.iterator.Next();
        const action = this.iterator.GetCurrentNode().value;
        const generator = action.apply();
        let result = await generator.next();
        while (!result.done) {
          await generator.next();
        }
      }
    } catch (error) {
      console.error((error as unknown as Error).message);
      this.processing = false;
      this.paused = true;
    }
    this.processing = false;
  }

  // Stop current and future playback
  pause() {
    this.processing = false;
  }

  // Rewind until a specific action is reached
  async rewindTo(action: Action) {}

  // Play until a specific action is reached
  async playTo(action: Action) {}

  // Add new actions onto the end of the timeline and play if not paused
  add(action: Action): void;
  add(actions: Action[]): void;
  add(actions: Action | Action[]) {
    if (Array.isArray(actions)) {
      for (const action of actions) {
        this.actions.AddFront(action);
      }
    } else {
      this.actions.AddFront(actions);
    }
    if (!this.processing) {
      this.play();
    }
  }
}
