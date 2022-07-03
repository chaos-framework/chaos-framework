import React from 'react';
import { useEffect, useRef } from 'react';
import WebGL2D from '@chaos-framework/webgl-renderer';
import { useChaosAPI } from '..';

export const WebGL2DRenderer = (props: any) => {
  // Get a handle on the current Chaos context
  const api = useChaosAPI();
  // Create a ref for the canvas we're about to render
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Initialize the WebGL context after canvas is first rendered and delete when the context goes away
  useEffect(() => {
    const renderer = new WebGL2D(canvasRef.current!, api);
    return () => renderer.shutdown();
  });

  return <canvas height="480px" width="640px" ref={canvasRef} />;
};
