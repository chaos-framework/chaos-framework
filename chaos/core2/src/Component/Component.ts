import { chaosId, Entity, Mechanic, ChaosInstance } from "../internal.js";

export type ComponentParent = Entity | ChaosInstance; // TODO world, player, team, game

export interface ComponentConstructionParameters {
  id?: string;
}

export abstract class Component<P extends ComponentParent = Entity> {
  readonly id: string;

  mechanics: Mechanic[] = [];

  constructor(parent: P, params: ComponentConstructionParameters = {}) {
    this.id = params.id || chaosId();
  }

  activate() {
  }

  deactivate() {
  }

}
