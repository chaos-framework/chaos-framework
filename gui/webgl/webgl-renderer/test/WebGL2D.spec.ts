import 'mocha';
import { expect } from 'chai';
import { Entity, Vector } from '@chaos-framework/core';

import WebGL2D from '../src/index.js';
import Camera from '../src/Camera.js';
import Room from './Mocks/Room.js';

describe('Renderer', function () {
  it('Can figure out which entities are on screen', function () {
    const camera = new Camera(new Vector(8, 8), 8, new Vector(128, 128)); // will see one chunk at a time
    const room = new Room(128, 128);
    const originEntity = new Entity();
    originEntity._publish(room, new Vector(0, 0));
    const closeEntity = new Entity();
    closeEntity._publish(room, new Vector(16, 16));
    const farEntity = new Entity();
    farEntity._publish(room, new Vector(35, 35));
    camera.cull(room);
    let visible = WebGL2D.getVisibleEntities(room, camera);
    expect(visible).to.contain(originEntity);
    expect(visible).to.not.contain(closeEntity);
    expect(visible).to.not.contain(farEntity);
    camera.panTo(new Vector(16, 16));
    camera.cull(room);
    visible = WebGL2D.getVisibleEntities(room, camera);
    expect(visible).to.contain(originEntity);
    expect(visible).to.contain(closeEntity);
    expect(visible).to.not.contain(farEntity);
    camera.viewport = new Vector(256, 256); // can now see 4x4 chunk area
    camera.cull(room);
    visible = WebGL2D.getVisibleEntities(room, camera);
    expect(visible).to.contain(originEntity);
    expect(visible).to.contain(closeEntity);
    expect(visible).to.not.contain(farEntity);
    camera.panTo(new Vector(17, 17));
    camera.cull(room);
    visible = WebGL2D.getVisibleEntities(room, camera);
    expect(visible).to.contain(originEntity);
    expect(visible).to.contain(closeEntity);
    expect(visible).to.contain(farEntity);
  });
});
