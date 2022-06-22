import { expect } from 'chai';
import 'mocha';
import { ArrayChunk, ByteLayer, Chaos, Entity, Player, Team, World } from '@chaos-framework/core';

import { QueryAPI } from '../src/internal.js';

import MockGame from './Mocks/MockGame.js';
import MockWorld from './Mocks/MockWorld.js';

describe('API', function () {
  const game = new MockGame();
  let api: QueryAPI;
  beforeEach(function () {
    game.reset();
    api = new QueryAPI(game);
  });

  describe('Game Integration', function () {
    it('Keeps a handle to the underlying game', function () {
      expect(api.game).to.equal(game);
    });

    it('Adds a hook to the game for every execution finish', function () {
      expect(Chaos.executionHooks).to.contain(api.boundHook);
    });
  });

  describe.skip('Subscriptions', function () {
    it.skip('Adds a subscription and returns the completed path', function () {});
  });

  describe('Base queries', function () {
    it('Gets all entities', function () {
      for (let i = 0; i < 5; i++) {
        const entity = new Entity();
        Chaos.addEntity(entity);
      }
      const query = api.entities();
      expect(query.value.size).to.equal(5);
      expect(query.value.values().next().value instanceof Entity).to.be.true;
    });

    it('Gets all players', function () {
      for (let i = 0; i < 5; i++) {
        const player = new Player();
        Chaos.addPlayer(player);
      }
      const query = api.players();
      expect(query.value.size).to.equal(5);
      expect(query.value.values().next().value instanceof Player).to.be.true;
    });

    it('Gets all teams', function () {
      for (let i = 0; i < 5; i++) {
        const team = new Team();
        Chaos.teams.set(team.id, team);
      }
      const query = api.teams();
      expect(query.value.size).to.equal(5);
      expect(query.value.values().next().value instanceof Team).to.be.true;
    });

    it('Gets all worlds', function () {
      for (let i = 0; i < 5; i++) {
        Chaos.addWorld(new MockWorld());
      }
      const query = api.worlds();
      expect(query.value.size).to.equal(5);
      expect(query.value.values().next().value instanceof World).to.be.true;
    });
  });
});
