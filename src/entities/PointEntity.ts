import { Entity } from './Entitity.ts';
import { DrawInfo, Shape } from '../App.types.ts';
import { Box, Point, Segment } from '@flatten-js/core';

export class PointEntity implements Entity {
  public point: Point;
  public isSelected: boolean = false;
  public isHighlighted: boolean = false;

  constructor(x: number, y: number) {
    this.point = new Point(x, y);
  }

  public draw(drawInfo: DrawInfo): void {
    drawInfo.context.beginPath();
    drawInfo.context.arc(this.point.x, this.point.y, 1, 0, Math.PI * 2);
    drawInfo.context.fill();
  }

  public intersectsWithBox(): boolean {
    return false;
  }

  public isContainedInBox(box: Box): boolean {
    if (!this.point) {
      return false;
    }
    return box.contains(this.point);
  }

  public getBoundingBox(): Box {
    return new Box(this.point.x, this.point.y, this.point.x, this.point.y);
  }

  public getShape(): Shape | null {
    return this.point;
  }

  public distanceTo(shape: Shape): [number, Segment] | null {
    if (!this.point) {
      return null;
    }
    return this.point.distanceTo(shape);
  }

  public getSvgString(): string | null {
    return this.point?.svg() || null;
  }
}
