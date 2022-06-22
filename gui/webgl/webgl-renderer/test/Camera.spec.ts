import { expect } from 'chai';
import 'mocha';
import { Vector } from '@chaos-framework/core';

import Camera from '../src/Camera.js';

describe('Camera', function () {
  describe('Culling', function () {
    it('Gets bounds correctly', function () {
      // Whole numbers
      const camera = new Camera(new Vector(0, 0), 8);
      let [bottomLeft, topRight] = camera.getBounds(new Vector(128, 128));
      expect(bottomLeft.equals(new Vector(0, 0))).to.be.true;
      expect(topRight.equals(new Vector(7, 7))).to.be.true;
      camera.setZoom(16);
      [bottomLeft, topRight] = camera.getBounds(new Vector(128, 128));
      expect(bottomLeft.equals(new Vector(0, 0))).to.be.true;
      expect(topRight.equals(new Vector(3, 3))).to.be.true;
      camera.panTo(new Vector(4, 4));
      [bottomLeft, topRight] = camera.getBounds(new Vector(128, 128));
      expect(bottomLeft.equals(new Vector(0, 0))).to.be.true;
      expect(topRight.equals(new Vector(7, 7))).to.be.true;
      camera.panTo(new Vector(5, 5));
      camera.setZoom(10);
      [bottomLeft, topRight] = camera.getBounds(new Vector(100, 100));
      expect(bottomLeft.equals(new Vector(0, 0))).to.be.true;
      expect(topRight.equals(new Vector(9, 9))).to.be.true;
      // Fractional
      camera.panTo(new Vector(50.5, 50.5));
      camera.setZoom(10);
      [bottomLeft, topRight] = camera.getBounds(new Vector(1000, 1000));
      expect(bottomLeft.equals(new Vector(0, 0))).to.be.true;
      expect(topRight.equals(new Vector(100, 100))).to.be.true;
    });

    it('Culls correctly', function () {
      const camera = new Camera(new Vector(0, 0));
      const viewportDimensions = new Vector(512, 512);
      camera.cull(viewportDimensions);
      expect(camera.chunksInView).contains('0_0');
      expect(camera.chunksInView).does.not.contain('0_1');
      expect(camera.chunksInView).does.not.contain('1_0');
      camera.panTo(new Vector(0.5, 0.5));
      camera.cull(viewportDimensions);
      expect(camera.chunksInView).contains('0_0');
      expect(camera.chunksInView).contains('0_1');
      expect(camera.chunksInView).contains('1_0');
      camera.panTo(new Vector(31.9, 31.9));
      camera.cull(viewportDimensions);
      expect(camera.chunksInView).does.contain('0_0');
      expect(camera.chunksInView).does.contain('1_2');
      expect(camera.chunksInView).does.contain('2_1');
    });

    it.skip('When panning and zooming correctly figures out which chunks are added and removed from frustrum', function () {});
  });
});
