import { Chaos, Component, Entity, Printable } from '../../internal.js';
import Terminal from '../Terminal.js';

// tslint:disable-next-line: max-classes-per-file

export class TerminalMessageFragment {
  type: 'entity' | 'component';

  constructor(public item: Printable, public replacement?: string) {
    if (item instanceof Entity) {
      this.type = 'entity';
    } else if (item instanceof Component) {
      this.type = 'component';
    } else {
      this.type = 'entity';
    }
  }

  print(): string {
    return this.replacement ?? this.item.print();
  }

  serialize(): TerminalMessageFragment.Serialized {
    return {
      type: this.type,
      item: this.serializeItem(),
      replacement: this.replacement
    };
  }

  serializeItem(): any {
    switch (this.type) {
      case 'entity':
        return (this.item as Entity).id;
      case 'component':
        return (this.item as Component).id;
    }
  }

  static deserialize(json: TerminalMessageFragment.Serialized): TerminalMessageFragment | string {
    const predicate = json.type === 'entity' ? Chaos.getEntity(json.item) : Chaos.getComponent(json.item);
    if (predicate === undefined) {
      return '???';
    }
    return new TerminalMessageFragment(predicate, json.replacement);
  }

}

// tslint:disable-next-line: no-namespace
export namespace TerminalMessageFragment {
  export interface Serialized {
    type: 'entity' | 'component',
    item: string,
    replacement?: string
  }

}
