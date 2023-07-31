import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';

import { Broadcast, Call, Chaos, EffectWithContext, Inner, Run, Subroutine } from './internal.js';

// should this be a class? honestly might as well be, way easier

export class Processor {
  subroutineStack: Stack<Subroutine> = new Stack<Subroutine>();
  queuedSubroutines: Queue<Subroutine> = new Queue<Subroutine>();

  currentSubroutine?: Subroutine;
  currentResult?: IteratorResult<EffectWithContext, EffectWithContext | void>;

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
      if (!this.currentSubroutine) {
        break;
      }

      do {
        this.currentResult = await this.currentSubroutine.next();
        const effect = this.currentResult.value;
        if (effect) {
          switch (effect.type) {
            case 'CALL':
              await this.handleCall(effect as Call);
              continue;
            case 'RUN':
              await this.handleRun(effect as Run);
              continue;
            case 'BROADCAST':
              await this.handleBroadcast(effect as Broadcast);
              continue;
            case 'INNER':
              await this.handleInner(effect as Inner);
              continue;
          }
        }
      } while (this.currentResult.value)

      // Now that the current subroutine has completed, check to see if it returned a final effect
    }

    this.currentlyProcessing = false;
  }

  private async handleRun(run: Run) {
    if (this.currentSubroutine && this.currentResult) {
      // Push the currently executing subroutine back onto the stack if it is not done
      if (!this.currentResult?.done) {
        this.subroutineStack.push(this.currentSubroutine)
      }
      // Begin executing the new one
      this.currentSubroutine = run[1];
    }
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

  private async handleBroadcast(broadcast: Broadcast) {
    if (this.currentSubroutine && this.currentResult) {
      // Push the currently executing subroutine back onto the stack if it is not done
      if (!this.currentResult?.done) {
        this.subroutineStack.push(this.currentSubroutine)
      }
      // Begin executing the new one
      this.currentSubroutine = this.game.broadcast(broadcast[1], broadcast[2]);
    }
  }

  private async handleInner(inner: Inner) {
    const broadcast = this.game.broadcast(inner[1], inner[2]);
    this.currentSubroutine?.next(broadcast);
  }

  private async wrapRunningSubroutine(subroutine: Subroutine) {
    
  }

}
