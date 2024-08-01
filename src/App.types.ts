import { Box, Circle, Point, Segment } from '@flatten-js/core';

export interface DrawInfo {
  context: CanvasRenderingContext2D;
  canvasSize: { x: number; y: number };
  mouse: Point;
}

export type Shape = Box | Segment | Point | Circle;
