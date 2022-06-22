import { Chunk } from '@chaos-framework/core';

import { IndividualQuery } from '../internal.js';

export class ChunkQuery extends IndividualQuery<Chunk<any>> {
  constructor(chunk: Chunk<any>, position?: string) {
    super(position || '', chunk);
  }

  tiles() {
    return new IndividualQuery<any>(this.append('tiles'), this.value.data);
  }
}
