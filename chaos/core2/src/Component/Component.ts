import { chaosId, Entity, Mechanic, Chaos } from "../internal.js";

export type ComponentParent = Entity | Chaos; // TODO world, player, team, game

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
