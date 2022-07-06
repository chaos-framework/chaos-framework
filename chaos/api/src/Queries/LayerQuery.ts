import { Chunk, Layer } from '@chaos-framework/core';

import { IndividualQuery, ChunkQuery } from '../internal.js';
import { RelativeCollectionQuery } from './Query.ts.js';

export class LayerQuery extends IndividualQuery<Layer<Chunk<any>>> {
  constructor(layer: Layer<Chunk<any>>, ref: string) {
    super(ref, layer);
  }

  name() {
    return new IndividualQuery<string>(this.append('name'), this.stringReference!);
  }

  chunks() {
    return new RelativeCollectionQuery<Chunk<any>, ChunkQuery>(
      this.append('chunks'),
      this.value.chunks,
      ChunkQuery
    );
  }
}
