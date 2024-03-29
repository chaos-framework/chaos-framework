import { expect } from 'chai';
import 'mocha';

import {
  Action,
  Entity,
  Chaos,
  MoveAction,
  Vector,
  Player,
  Team,
  PublishedEntity
} from '../../../src/internal.js';

import Room from '../../Mocks/Worlds/Room.js';
import { SensesAll } from '../../Mocks/Components/Functional.js';

describe('Action Integration', () => {
  describe('Caches sensory information from all involved entities', () => {
    let action: MoveAction;
    let witness: Entity;
    let mover: Entity;
    let room: Room;

    beforeEach(() => {
      Chaos.reset();
      room = new Room();
      witness = new Entity();
      witness._attach(new SensesAll());
      witness._publish(room, room.stageLeft);
      mover = new Entity();
      mover._publish(room, room.stageRight);
      action = new MoveAction({
        caster: mover,
        target: mover as PublishedEntity,
        to: mover.position.add(new Vector(1, 0))
      });
    });

    it('Assumes caster can sense everything, regardless of sensory components', async () => {
      await action.runPrivate();
      expect(action.sensors.has(mover.id)).to.be.true;
      expect(action.sensors.get(mover.id)).to.be.true;
    });

    // it('Stores that witness has sensed the action', () => {
    //   action.execute();
    //   expect(action.sensors.has(witness.id)).to.be.true;
    //   expect(action.sensors.get(witness.id)).to.be.true;
    // });
  });

  describe('Lets various entities, players, teams, and worlds, and game listen to an action', () => {
    it('Lets players and teams of affected entities listen to an action', () => {
      const room = new Room(100, 100);
      const caster = new Entity();
      caster._publish(room, room.stageLeft);
      const target = new Entity();
      target._publish(room, room.stageRight);
      const castingPlayer = new Player({ username: 'Caster' });
      castingPlayer._publish();
      const targetPlayer = new Player({ username: 'Target' });
      targetPlayer._publish();
      const castingTeam = new Team({ name: 'Casting Team' });
      castingTeam._publish();
      caster.team = castingTeam;
      const targetTeam = new Team({ name: 'Target Team' });
      targetTeam._publish();
      target.team = targetTeam;
      castingPlayer._ownEntity(caster);
      targetPlayer._ownEntity(target);
      const action = new MoveAction({
        caster,
        target: target as PublishedEntity,
        to: target.position.copyAdjusted(1, 0)
      });
      action.collectListeners();
      expect(action.listeners.has(castingPlayer.id)).to.be.true;
      expect(action.listeners.has(castingTeam.id)).to.be.true;
      expect(action.listeners.has(targetPlayer.id)).to.be.true;
      expect(action.listeners.has(targetTeam.id)).to.be.true;
    });

    describe('Entities, targets, witnesses, and world when caster and target are in same world', () => {
      let action: MoveAction;
      let caster: Entity;
      let target: Entity;
      let casterWitness: Entity;
      let targetWitness: Entity;
      let room: Room;
      beforeEach(() => {
        Chaos.reset();
        room = new Room(100, 100);
        caster = new Entity();
        caster._publish(room, room.stageLeft);
        casterWitness = new Entity();
        casterWitness._publish(room, room.stageLeft.add(new Vector(0, -1)));
        target = new Entity();
        target._publish(room, room.stageRight);
        targetWitness = new Entity();
        targetWitness._publish(room, room.stageRight.add(new Vector(0, -1)));
        // TODO need to get witness players and teams as well... right? ahhh may need a method on each entity to gather listeners as well
        // that'll actually be really nice but not the priority at the moment
        action = target.moveRelative({ caster, amount: new Vector(1, 0) });
        Chaos.setListenDistance(25); // the default, but enforcing just in case
      });

      it('Includes caster, target, their worlds, witnesses in respective worlds, and the game', () => {
        action.collectListeners();
        expect(action.listeners.has(caster.id)).to.be.true;
        expect(action.listeners.has(target.id)).to.be.true;
        expect(action.listeners.has(casterWitness.id)).to.be.true;
        expect(action.listeners.has(targetWitness.id)).to.be.true;
        expect(action.listeners.has(room.id)).to.be.true;
        expect(action.listeners.has(Chaos.reference.id)).to.be.true;
      });

      it('Does not include witnesses that are outside of listening radius', () => {
        const nearbyWitness = new Entity();
        nearbyWitness._publish(room, room.stageLeft.add(new Vector(10, 10)));
        const tooFarWitness = new Entity();
        tooFarWitness._publish(room, room.stageLeft.add(new Vector(20, 40)));
        action.collectListeners();
        expect(action.listeners.has(nearbyWitness.id)).to.be.true;
        expect(action.listeners.has(tooFarWitness.id)).to.be.false;
      });
    });

    describe('Entities, targets, witnesses, and worlds when caster and target are in different worlds', () => {
      let action: MoveAction;
      let caster: Entity;
      let target: Entity;
      let casterWitness: Entity;
      let targetWitness: Entity;
      let casterRoom: Room;
      let targetRoom: Room;
      beforeEach(() => {
        Chaos.reset();
        casterRoom = new Room();
        targetRoom = new Room();
        caster = new Entity();
        caster._publish(casterRoom, casterRoom.stageLeft);
        casterWitness = new Entity();
        casterWitness._publish(casterRoom, casterRoom.stageLeft.add(new Vector(0, -1)));
        target = new Entity();
        target._publish(targetRoom, targetRoom.stageRight);
        targetWitness = new Entity();
        targetWitness._publish(targetRoom, targetRoom.stageLeft.add(new Vector(0, -1)));
        action = target.moveRelative({ caster, amount: new Vector(1, 0) });
      });

      it('Includes caster, target, their worlds, witnesses in respective worlds, players, teams, and the game', () => {
        action.collectListeners();
        expect(action.listeners.has(caster.id)).to.be.true;
        expect(action.listeners.has(target.id)).to.be.true;
        expect(action.listeners.has(casterWitness.id)).to.be.true;
        expect(action.listeners.has(targetWitness.id)).to.be.true;
        expect(action.listeners.has(casterRoom.id)).to.be.true;
        expect(action.listeners.has(targetRoom.id)).to.be.true;
        expect(action.listeners.has(Chaos.reference.id)).to.be.true;
      });
    });
  });
});
