import { Component, Action, PropertyChangeAction, EquipItemAction } from '../../../src/internal.js';

import { Slash, Stab } from '../Abilities/Attacks.js';

export class Sword extends Component {
  name = 'Sword';
  public = true;
  broadcast = true;
  tags = new Set<string>(['Property']);
  unique = true;

  modify(a: Action) {
    if (
      a instanceof EquipItemAction &&
      a.item === this.parent &&
      a.slot.toLowerCase().includes('hand')
    ) {
      a.addPermission(true); // allow this action
    }
  }

  react(a: Action) {
    if (
      a instanceof EquipItemAction &&
      a.item === this.parent &&
      a.slot.toLowerCase().includes('hand')
    ) {
      // TODO add slash and hack abilities to target
      a.target.learn({ ability: new Slash(), using: this, grantedBy: this });
      a.target.learn({ ability: new Stab(), using: this, grantedBy: this });
    }
  }
}

export class Iron extends Component {
  public = true;
  broadcast = true;
  tags = new Set<string>(['Property']);
  unique = true;

  // Iron does a bit more damage than, say, wood
  modify(a: Action) {
    if (
      a.using === this.parent &&
      a instanceof PropertyChangeAction &&
      a.tagged('attack') &&
      a.effects('HP') &&
      a.amount < 0
    ) {
      a.multiply(1.1);
    }
  }
}

export class Silver extends Component {
  public = true;
  broadcast = true;
  tags = new Set<string>(['Property']);
  unique = true;

  // Silver does a lot of damage, and even more to beasts
  modify(a: Action) {
    if (
      a.using === this.parent &&
      a instanceof PropertyChangeAction &&
      a.tagged('attack') &&
      a.effects('HP') &&
      a.amount < 0
    ) {
      a.multiply(1.3);
      if (a.target && a.target.is('Beast')) {
        a.multiply(1.1);
      }
    }
  }
}
