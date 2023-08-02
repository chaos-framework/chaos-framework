import { Game, Subroutine } from "./types.js";

export class Chaos {
  // message buses

  // all entities
  // all components

  // all players + clients
  
  // INJECTABLE:
  // processor
  // action handler
  // broadcaster

  constructor(private game: Game) {

  }

  async *broadcast(messageType: string, payload: any): Subroutine {
    
  }

}
