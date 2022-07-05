import { Socket } from 'socket.io';
import { ulid } from 'ulid';
import { Queue } from 'queue-typescript';

import { Client, MessageType, Player } from '@chaos-framework/core';

export class IOServerClient implements Client {
  id = ulid();
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
    for (const serializedAction of this.broadcastQueue) {
      return this.socket.emit(MessageType.ACTION, serializedAction);
    }
    return true;
  }

  disconnect(): boolean {
    this.socket.disconnect(true);
    return true;
  }
}
