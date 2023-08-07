import { ChaosInstance, Component, World, Vector2, chaosId, ComponentContainer } from "../internal.js";

export interface EntityConstructionParameters {
  id?: string,
  name?: string
}

export interface SerializedEntity {

}

export class Entity extends ComponentContainer {
  readonly id: string;
  name: string;

  position!: Vector2;

  published = false;

  constructor(private game: ChaosInstance, params: EntityConstructionParameters = {}) {
    super();
    this.id = params.id || chaosId();
    this.name = params.name || 'Unnamed';
  }
  _publish(world: World, location: Vector2) { }
  _unpublish() { }

  _move() {}

  serialize() {

  }

  static deserialize(game: ChaosInstance, serialized: SerializedEntity): Entity {
    return new Entity(game); // TODO
  }
}
