import { Property } from '@chaos-framework/core';

import { IndividualQuery } from '../internal.js';

export class PropertyQuery extends IndividualQuery<Property> {
  constructor(property: Property) {
    super(`${property.entity.id}_${property.name}`, property);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  current() {
    return new IndividualQuery<number>(this.append('current'), this.value.current.calculated);
  }

  min() {
    return new IndividualQuery<number>(this.append('min'), this.value.min.calculated);
  }

  max() {
    return new IndividualQuery<number>(this.append('max'), this.value.max.calculated);
  }

}
