import {  EffectContext, EffectWithContext, Entity, Mechanic, MechanicParameters, Chaos } from "../internal.js";

export type ComponentParent = Entity | Chaos; // TODO world, player, team, game

export abstract class Component<P extends ComponentParent = Entity> {
  mechanics: Mechanic[] = [];

  constructor(parent: P) {

  }

  activate() {
  }

  deactivate() {
  }

}
