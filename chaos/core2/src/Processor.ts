import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';

import { Call, Chaos, SubRoutineYieldable, Subroutine, Update } from './internal.js';

// should this be a class? honestly might as well be, way easier

export class Processor {
  subroutineStack: Stack<Subroutine> = new Stack<Subroutine>();
  queuedSubroutines: Queue<Subroutine> = new Queue<Subroutine>();

  currentSubroutine?: Subroutine;
  currentResult?: IteratorResult<SubRoutineYieldable>;

  currentlyProcessing = false;

  constructor(private game: Chaos) {

  }

  async run(subroutine: Subroutine) {
    // Check to make sure we're not waiting on other subroutines right now
    if (this.currentlyProcessing) {
      this.queuedSubroutines.append(subroutine);
      return;
    }

    this.currentlyProcessing = true;

    this.subroutineStack.push(subroutine);

    while (this.subroutineStack.length > 0 || this.queuedSubroutines.length > 0) {
      // Grab from the queue if the stack is exhausted
      if (this.subroutineStack.length === 0) {
        this.subroutineStack.push(this.queuedSubroutines.dequeue());
      }

      this.currentSubroutine = this.subroutineStack.pop();
      do {
        this.currentResult = await this.currentSubroutine.next();
        const effect = this.currentResult.value;
        if (effect) {
          switch (effect[0]) {
            case 'CALL':
              await this.handleCall(effect[1]);
              continue;
          }
        }
      } while (this.currentResult)

      // Now that the current subroutine has completed, check to see if it returned a final effect
    }

    this.currentlyProcessing = false;
  }

  private async handleCall(call: Call) {
    if (this.currentSubroutine && this.currentResult) {
      // Push the currently executing subroutine back onto the stack if it is not done
      if (!this.currentResult?.done) {
        this.subroutineStack.push(this.currentSubroutine)
      }
      // Begin executing the new one
      this.currentSubroutine = await call[1].apply(undefined, call[2]);
    }
  }

}
