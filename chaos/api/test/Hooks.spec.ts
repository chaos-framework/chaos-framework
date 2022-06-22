import { expect } from 'chai';
import 'mocha';
import { Entity, Player, Team, Vector } from '@chaos-framework/core';

import { PlayerQuery, QueryAPI, TeamQuery } from '../src/internal.js';
import MockGame from './Mocks/MockGame.js';
import MockWorld from './Mocks/MockWorld.js';
import { entities } from '@chaos-framework/core/lib/Game/Chaos';

function createIncrementHook(): [{ count: number }, (value: any) => void] {
  let obj = { count: 0 };
  return [
    obj,
    (value: any) => {
      obj.count++;
    }
  ];
}

describe('Hooks', function () {
  const game = new MockGame();
  let api: QueryAPI;
  beforeEach(function () {
    game.reset();
    api = new QueryAPI(game);
  });

  describe('PublishPlayerAction', function () {
    it(`Fire on all players and the newly published players's team`, function () {
      const team = new Team();
      const [allPlayersCount, allPlayersCallback] = createIncrementHook();
      const [playerTeamCount, playerTeamCallback] = createIncrementHook();
      api.addSubsciption(api.players(), 'allPlayers', allPlayersCallback);
      api.addSubsciption(new TeamQuery(team).players(), 'playerTeam', playerTeamCallback);
      const player = new Player();
      player.team = team;
      api.hook([player.publish()]);
      expect(allPlayersCount.count).to.equal(1);
      expect(playerTeamCount.count).to.equal(1);
    });
  });

  describe('PublishEntityAction', function () {
    it(`Fire on all entities, the world, the entity's team, and owning players`, function () {
      const entity = new Entity();
      const team = new Team();
      const world = new MockWorld();
      const player1 = new Player();
      const player2 = new Player();
      const [allEntities, allCallback] = createIncrementHook();
      // const [worldEntities, worldCallback] = createIncrementHook();
      const [player1Entities, player1Callback] = createIncrementHook();
      const [player2Entities, player2Callback] = createIncrementHook();
      const [teamEntities, teamCallback] = createIncrementHook();
      api.addSubsciption(api.entities(), 'allEntities', allCallback);
      // api.addSubsciption(new WorldQuery(world).entities(), 'worldEntities', worldCallback);
      api.addSubsciption(new PlayerQuery(player1).entities(), 'player1Entities', player1Callback);
      api.addSubsciption(new PlayerQuery(player2).entities(), 'player2Entities', player2Callback);
      api.addSubsciption(new TeamQuery(team).entities(), 'teamEntities', teamCallback);

      entity.team = team;
      entity.players.set(player1.id, player1);
      entity.players.set(player2.id, player2);
      api.hook([entity.publish({ world, position: new Vector(0, 0) })]);
      expect(allEntities.count).to.equal(1);
      expect(player1Entities.count).to.equal(1);
      expect(player2Entities.count).to.equal(1);
      expect(teamEntities.count).to.equal(1);
    });
  });
});
