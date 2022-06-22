export type Condition<T> = (item: T) => boolean;

export interface Query {
  path: string;
  value: any;
}

export class IndividualQuery<T> implements Query {
  constructor(public path: string, public value: T, public stringReference?: string) {}

  append(path: string): string {
    return `${this.path}.${path}`;
  }
}

export class CollectionQuery<T, C> implements Query, Iterable<[string, C]> {
  condition?: Condition<T>;

  constructor(
    public path: string,
    public value: Map<string, T>,
    private CConstructor: { new (item: T, path?: string): C }
  ) {}

  where(condition: Condition<T>): CollectionQuery<T, C> {
    this.condition = condition;
    return this;
  }

  get(id: string): C | undefined {
    const item = this.value.get(id);
    if (item !== undefined) {
      return new this.CConstructor(item);
    } else {
      return undefined;
    }
  }

  [Symbol.iterator](): IterableIterator<[string, C]> {
    return this.iterator();
  }

  *iterator(): IterableIterator<[string, C]> {
    for (const [key, item] of this.value.entries()) {
      yield [key, new this.CConstructor(item)];
    }
  }

  map(fn: (value: [string, C], index?: number) => any): [string, C][] {
    return Array.from(this.iterator()).map(fn);
  }
}

export class RelativeCollectionQuery<T, C> implements Query, Iterable<[string, C]> {
  condition?: Condition<T>;

  constructor(
    public path: string,
    public value: Map<string, T>,
    private CConstructor: { new (item: T, path: string): C }
  ) {}

  where(condition: Condition<T>): RelativeCollectionQuery<T, C> {
    this.condition = condition;
    return this;
  }

  get(id: string): C | undefined {
    const item = this.value.get(id);
    if (item !== undefined) {
      return new this.CConstructor(item, `${this.path}.${id}`);
    } else {
      return undefined;
    }
  }

  [Symbol.iterator](): IterableIterator<[string, C]> {
    return this.iterator();
  }

  *iterator(): IterableIterator<[string, C]> {
    for (const [key, item] of this.value.entries()) {
      yield [key, new this.CConstructor(item, `${this.path}.${key}`)];
    }
  }

  map(fn: (value: [string, C], index?: number) => any): [string, C][] {
    return Array.from(this.iterator()).map(fn);
  }
}
