import { Component } from '@chaos-framework/core';

import { IndividualQuery } from '../internal.js';

export class ComponentQuery extends IndividualQuery<Component> {
  constructor(component: Component) {
    super(component.id, component);
  }

  id() {
    return new IndividualQuery<string>(this.append('id'), this.value.id);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  description() {
    return new IndividualQuery<string | undefined>(this.append('description'), this.value.description);
  }
}
