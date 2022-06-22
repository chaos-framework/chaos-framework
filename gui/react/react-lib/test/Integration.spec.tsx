import { expect } from 'chai';
import 'mocha';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Chaos, Entity, PublishEntityAction, Vector, World } from '@chaos-framework/core';
import { EntityQuery, QueryAPI } from '@chaos-framework/api';

import { useChaos, ChaosProvider, useChaosAPI } from '../src/internal';

import MockGame from './Mock/MockGame';
import MockWorld from './Mock/MockWorld';

const App = (props: { api: QueryAPI }) => {
  return (
    <ChaosProvider value={props.api}>
      <EntityList></EntityList>
    </ChaosProvider>
  );
};

const EntityList = (props: any) => {
  const api = useChaosAPI();
  const [, query] = useChaos(api.entities());
  return (
    <span>
      {query.map(([id, query]) => (
        <EntityNamePrinter key={id} entity={query}></EntityNamePrinter>
      ))}
    </span>
  );
};

const EntityNamePrinter = (props: { entity: EntityQuery }) => {
  const [id] = useChaos(props.entity.id());
  const [name] = useChaos(props.entity.name());
  return <span key={id}>{name}</span>;
};

describe('Integration testing', () => {
  let rootContainer: HTMLDivElement;

  let world: World;
  beforeEach(() => {
    rootContainer = document.createElement('div');
    document.body.appendChild(rootContainer);
    world = new MockWorld({});
    Chaos.worlds.set(world.id, world);
  });

  afterEach(() => {
    document.body.removeChild(rootContainer);
    Chaos.reset();
  });

  it('Renders and passes context to children', () => {
    const api = new QueryAPI(new MockGame());
    const app = <App api={api} />;
    act(() => {
      ReactDOM.render(app, rootContainer);
    });
    expect(rootContainer.textContent).to.equal('');
    Chaos.processor.enqueue(
      new PublishEntityAction({
        entity: new Entity({ name: 'EntityONE' }),
        world,
        position: new Vector(0, 0)
      })
    );
    Chaos.processor.enqueue(
      new PublishEntityAction({
        entity: new Entity({ name: 'EntityABC' }),
        world,
        position: new Vector(0, 0)
      })
    );
    Chaos.processor.process(); // make sure hook is called
    expect(rootContainer.textContent).to.contain('EntityONE');
    expect(rootContainer.textContent).to.contain('EntityABC');
  });
});
