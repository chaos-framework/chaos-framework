import { expect } from 'chai';
import 'mocha';
import { Entity, Player, Team } from '@chaos-framework/core';

import { EntityQuery, PlayerQuery, TeamQuery, WorldQuery } from '../src/internal';

import MockWorld from './Mocks/MockWorld';

describe('Queries', function () {
  describe('Entity Queries', function () {
    const entity = new Entity({ name: 'Test Entity' });
    const entityQuery = new EntityQuery(entity);

    it('Returns the expected base object', function () {
      expect(entityQuery.value).to.equal(entity);
      expect(entityQuery.path).to.equal(entity.id);
    });

    it('ID', function () {
      const id = entityQuery.id();
      expect(id.value).to.equal(entity.id);
      expect(id.path).to.equal(entityQuery.path + '.id');
    });

    it('Name', function () {
      const name = entityQuery.name();
      expect(name.value).to.equal(entity.name);
      expect(name.path).to.equal(entityQuery.path + '.name');
    });

    it('Components', function () {
      const components = entityQuery.components();
      expect(components.value).to.equal(entity.components.all);
      expect(components.path).to.equal(entityQuery.path + '.components');
    });

    it('Owners (Players)', function () {
      const players = entityQuery.players();
      expect(players.value).to.equal(entity.players);
      expect(players.path).to.equal(entityQuery.path + '.players');
    });
  });

  describe('Player Queries', function () {
    const player = new Player({ username: 'Test Player' });
    const playerQuery = new PlayerQuery(player);

    it('Returns the expected base object', function () {
      expect(playerQuery.value).to.equal(player);
      expect(playerQuery.path).to.equal(player.id);
    });

    it('ID', function () {
      const id = playerQuery.id();
      expect(id.value).to.equal(player.id);
      expect(id.path).to.equal(playerQuery.path + '.id');
    });

    it('Name', function () {
      const name = playerQuery.username();
      expect(name.value).to.equal(player.username);
      expect(name.path).to.equal(playerQuery.path + '.username');
    });

    it('Entities', () => {
      const entities = playerQuery.entities();
      expect(entities.value).to.equal(player.entities);
      expect(entities.path).to.equal(playerQuery.path + '.entities');
    });
  });

  describe('Team Queries', function () {
    const team = new Team({ name: 'Test Team' });
    const teamQuery = new TeamQuery(team);

    it('Returns the expected base object', function () {
      expect(teamQuery.value).to.equal(team);
      expect(teamQuery.path).to.equal(team.id);
    });

    it('ID', function () {
      const id = teamQuery.id();
      expect(id.value).to.equal(team.id);
      expect(id.path).to.equal(teamQuery.path + '.id');
    });

    it('Name', function () {
      const name = teamQuery.name();
      expect(name.value).to.equal(team.name);
      expect(name.path).to.equal(teamQuery.path + '.name');
    });

    it('Players', () => {
      const players = teamQuery.players();
      expect(players.value).to.equal(team.players);
      expect(players.path).to.equal(teamQuery.path + '.players');
    });

    it('Entities', () => {
      const entities = teamQuery.entities();
      expect(entities.value).to.equal(team.entities);
      expect(entities.path).to.equal(teamQuery.path + '.entities');
    });
  });

  describe('World', function () {
    const world = new MockWorld();
    const worldQuery = new WorldQuery(world);

    it('Returns the expected base object', function () {
      expect(worldQuery.value).to.equal(world);
      expect(worldQuery.path).to.equal(world.id);
    });

    it('ID', function () {
      const id = worldQuery.id();
      expect(id.value).to.equal(world.id);
      expect(id.path).to.equal(worldQuery.path + '.id');
    });

    it('Name', function () {
      const name = worldQuery.name();
      expect(name.value).to.equal(world.name);
      expect(name.path).to.equal(worldQuery.path + '.name');
    });

    it('Entities', function () {
      const entities = worldQuery.entities();
      expect(entities.value).to.equal(world.entities);
      expect(entities.path).to.equal(worldQuery.path + '.entities');
    });

    it('Components', function () {
      const components = worldQuery.components();
      expect(components.value).to.equal(world.components.all);
      expect(components.path).to.equal(worldQuery.path + '.components');
    });

    describe('Layers', function () {
      const layersQuery = worldQuery.layers();
      const baseLayerQuery = layersQuery.get('base');
      it('Has Layers', function () {
        expect(layersQuery.value).to.equal(world.layers);
        expect(layersQuery.path).to.equal(worldQuery.path + '.layers');
        expect(baseLayerQuery).to.exist;
      });

      it('Sets the layer path relative to parent', function () {
        expect(baseLayerQuery!.path).to.equal(`${layersQuery.path}.base`);
      });

      describe('Chunks', function () {
        const chunksQuery = baseLayerQuery!.chunks();

        it('Has chunks', function () {
          expect(chunksQuery).to.exist;
          expect(chunksQuery!.value).to.equal(baseLayerQuery!.value.chunks);
        });

        it('Can get individual chunks and read tiles', function () {
          const chunkQuery = chunksQuery!.get('0_0');
          expect(chunkQuery).to.exist;
          const chunk = chunkQuery!.value;
          expect(chunk).to.exist;
          expect(chunk.getTile(0, 0)).to.equal(0);
        });
      });
    });
  });
});
