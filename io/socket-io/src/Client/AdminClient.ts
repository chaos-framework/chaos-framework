import { CONNECTION_RESPONSE, MessageType, Chaos } from '@chaos-framework/core';

import { IOClient } from './IOClient.js';

export class AdminClient extends IOClient {
  constructor(uri: string, desiredUsername: string, connectionOptions: any) {
    super(uri, { desiredUsername, isAdmin: true }, connectionOptions);
    this.initializeAdminEvents();
  }

  initializeAdminEvents() {
    // Handle connection as an admin -- no need to set a local player
    this.socket.on(MessageType.CONNECTION_RESPONSE, (response: CONNECTION_RESPONSE) => {
      Chaos.DeserializeAsClient(response.gameState);
      this.loaded = true;
      if (this.connectionCallback !== undefined) {
        this.connectionCallback();
      }
    });
  }
}
