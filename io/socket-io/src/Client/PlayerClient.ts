import { CONNECTION_RESPONSE, MessageType, Chaos, Player } from '@chaos-framework/core';

import { IOClient } from './IOClient.js';

export class PlayerClient extends IOClient {
  player: Player;

  constructor(uri: string, desiredUsername: string, connectionOptions: any) {
    super(uri, { desiredUsername, isAdmin: false }, connectionOptions);
    this.player = new Player({ username: 'Awaiting Connection' });
    this.initializePlayerEvents();
  }

  initializePlayerEvents() {
    this.socket.on(MessageType.CONNECTION_RESPONSE, (response: CONNECTION_RESPONSE) => {
      Chaos.DeserializeAsClient(response.gameState, response.connectedPlayerId);
      const player = Chaos.players.get(response.connectedPlayerId);
      if (player === undefined) {
        this.disconnect();
        throw new Error('Got a bad response from the server -- was assigned to a non-existant player.');
      }
      this.player = player;
      this.loaded = true;
      if (this.connectionCallback !== undefined) {
        this.connectionCallback();
      }
    });
  }
}
