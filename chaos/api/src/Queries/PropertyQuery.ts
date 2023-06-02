import { Property } from '@chaos-framework/core';

import { IndividualQuery } from '../internal.js';

export class PropertyQuery extends IndividualQuery<Property> {
  constructor(property: Property) {
    super(property.name, property);
  }

  // id() {
  //   return new IndividualQuery<string>(this.append('id'), this.value.entity.id );
  // }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.value.name);
  }

  current() {
    return new IndividualQuery<number>(this.append('name'), this.value.current.calculated);
  }

  min() {
    return new IndividualQuery<number>(this.append('name'), this.value.min.calculated);
  }

  max() {
    return new IndividualQuery<number>(this.append('name'), this.value.max.calculated);
  }

}
