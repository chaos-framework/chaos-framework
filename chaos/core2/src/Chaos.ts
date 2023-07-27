import { Subroutine } from "./types.js";

export abstract class Chaos {
  // message buses

  // all entities
  // all components

  // all players + clients
  
  // processor

  async *broadcast(messageType: string, payload: any): Subroutine {
    
  }

  // abstract *initialize
  // abstract *onPlayerJoin
  // abstract *onPlayerQuit
  // abstract *reset
  // abstract *shutdown
}