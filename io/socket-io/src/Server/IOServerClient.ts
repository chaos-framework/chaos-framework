import { Socket } from 'socket.io';
import { Queue } from 'queue-typescript';

import { Client, MessageType, Player, chaosUniqueId } from '@chaos-framework/core';

export class IOServerClient implements Client {
  id = chaosUniqueId();
  broadcastQueue = new Queue<any>();
  isAdmin: boolean = false;

  constructor(public socket: Socket, public player?: Player) {
    if (player) {
      player.clients.set(this.id, this);
    }
  }

  broadcast(messageType: MessageType, message: string | Object): boolean {
    return this.socket.emit(messageType, message);
  }

  broadcastEnqueued(): boolean {
    for (const action of this.broadcastQueue) {
      if (this.isAdmin) {
        // Actions are not pre-serialized for admins
        const serialized = action.serialize();
        this.socket.emit(MessageType.ACTION, serialized);
      } else {
        this.socket.emit(MessageType.ACTION, action);
      }
    }
    this.broadcastQueue = new Queue<any>();
    return true;
  }

  disconnect(): boolean {
    this.socket.disconnect(true);
    return true;
  }
}
