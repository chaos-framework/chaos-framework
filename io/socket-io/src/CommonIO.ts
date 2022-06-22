import { CONNECTION, CONNECTION_RESPONSE, MessageType } from '@chaos-framework/core';

export interface ServerToClientEvents {
  [MessageType.CONNECTION_RESPONSE]: (res: CONNECTION_RESPONSE) => void;
  [MessageType.ACTION]: (json: any) => void;
}

export interface ClientToServerEvents {
  cast: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}
