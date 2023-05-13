import { Property } from '@chaos-framework/core';

import { IndividualQuery } from '../internal.js';

export class PropertyQuery extends IndividualQuery<Property> {
  constructor(property: Property) {
    super(property.name, property);
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
