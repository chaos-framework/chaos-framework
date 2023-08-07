import { Ability, Component, Entity } from "./internal.js";

type AbilityCatalog = Map<string, Map<string, Ability>>;

type AbilityGranter = Entity | Component;

export abstract class ComponentContainer {
  abilities = new Map<string, Map<string, Ability>>;
  components = new Map<string, Component>();

  _attach(component: Component) {
    this.components.set(component.id, component);
  }

  _detach(component: Component) {

  }

  _learn(ability: Ability, granter: AbilityGranter) {
    if (this.abilities.has(ability.name)) {
      this.abilities.set(ability.name, new Map<string, Ability>([[granter.id, ability]]));
    } else {
      this.abilities.get(ability.name)!.set(granter.id, ability);
    }
  }

  _unlearn(ability: Ability, granter: AbilityGranter) {
    if (!this.abilities.has(ability.name)) {
      // nothing to remove
      return;
    } else {
      this.abilities.get(ability.name)!.delete(granter.id);
      if (this.abilities.get(ability.name)!.size === 0) {
        this.abilities.delete(ability.name);
      }
    }
  }

}
