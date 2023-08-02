import { Chaos, Component, World, Vector2 } from "../internal.js";

export class Entity {
  components = new Map<string, Component>();

  constructor(private game: Chaos) {}

  _attach(component: Component) {
    
  }

  _detach(component: Component) {

  }

  _publish(world: World, location: Vector2) { }
  _unpublish() { }

  _move() {}
}
