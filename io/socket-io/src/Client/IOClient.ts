import { io, Socket } from 'socket.io-client';
import { Queue } from 'queue-typescript';
import {
  Client,
  Player,
  CONNECTION,
  CONNECTION_RESPONSE,
  MessageType,
  Chaos,
  ActionDeserializer,
  processRunner,
  chaosUniqueId
} from '@chaos-framework/core';

import { ServerToClientEvents, ClientToServerEvents } from '../CommonIO.js';

export abstract class IOClient implements Client {
  id = chaosUniqueId();
  broadcastQueue = new Queue<any>();
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  loaded = false;
  connectionCallback?: (err?: string) => void; // optional callback to notify app that the loading has completed

  constructor(uri: string, query: any, connectionOptions: any) {
    this.socket = io(uri, { query, autoConnect: false, ...connectionOptions });
    this.initializeCommonEvents();
  }

  initializeCommonEvents() {
    this.socket.on(MessageType.ACTION, (json: any) => {
      try {
        console.log(JSON.stringify(json));
        const action = ActionDeserializer.deserializeAction(json);
        Chaos.timeline.add(action);
      } catch (err) {
        console.error('Got a bad action payload from the server that could not be deserialized.');
        console.error((err as Error).message);
        //this.disconnect();
      }
    });
  }

  connect(uri: string) {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    return true;
  }

  broadcast(): boolean {
    return false; // TODO this broadcasts TO the server
  }

  broadcastEnqueued(): boolean {
    return false; // TODO this broadcasts TO the server
  }

  disconnect(): boolean {
    this.socket.disconnect();
    return true;
  }
}
