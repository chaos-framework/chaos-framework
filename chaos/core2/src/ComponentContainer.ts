import { Component } from "./internal.js";

export abstract class ComponentContainer {
  components = new Map<string, Component>();

  _attach(component: Component) {
    this.components.set(component.id, component);
  }

  _detach(component: Component) {

  }

}