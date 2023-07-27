import { Printable, isPrintable, TerminalMessageFragment, Chaos } from '../../internal.js';

export class TerminalMessage {
  channel?: string;
  fragments: (string | TerminalMessageFragment)[] = [];

  constructor(...items: (string | Printable | TerminalMessageFragment | undefined)[]) {
    for (const item of items) {
      if (item !== undefined) {
        if (!(item instanceof TerminalMessageFragment) && isPrintable(item)) {
          this.fragments.push(new TerminalMessageFragment(item));
        } else {
          this.fragments.push(item);
        }
      }
    }
  }

  print(): string {
    const strings = [];
    for (const fragment of this.fragments) {
      strings.push(fragment instanceof TerminalMessageFragment ? fragment.print() : fragment);
    }
    return strings.join(' ');
  }

  serialize(): TerminalMessage.Serialized {
    return {
      channel: this.channel,
      fragments: this.fragments.map(fragment => typeof fragment === 'string' ? fragment : fragment.serialize())
    };
  }

  static deserialize(json: TerminalMessage.Serialized): TerminalMessage {
    const items: (string | TerminalMessageFragment)[] = [];

    for (const fragment of json.fragments) {
      if (typeof fragment === 'string') {
        items.push(fragment);
      } else {
        if (fragment.type === 'entity') {
          const entity = Chaos.getEntity(fragment.item);
          if (entity !== undefined) {
            items.push(new TerminalMessageFragment(entity, fragment.replacement));
          } else {
            items.push('???'); // TODO "unknown" string should be a static on Entity, not defined in diff places
          }
        }
        if (fragment.type === 'component') {
          const component = Chaos.allComponents.get(fragment.item);
          if (component !== undefined) {
            items.push(new TerminalMessageFragment(component, fragment.replacement));
          } else {
            items.push('???'); // TODO "unknown" string should be a static on Component, not defined in diff places
          }
        }
      }
    }
    return new TerminalMessage(...items); // TODO destructing array again -- inefficient?
  }

}

// tslint:disable-next-line: no-namespace
export namespace TerminalMessage {
  export interface Serialized {
    channel?: string,
    fragments: (string | TerminalMessageFragment.Serialized)[]
  }
}