import { Entity, EntityName, JsonEntity } from './Entity.ts';
import { DrawInfo, Shape, SnapPoint, SnapPointType } from '../App.types.ts';
import * as Flatten from '@flatten-js/core';
import { Box, Point, Relations, Segment } from '@flatten-js/core';
import { worldToScreen } from '../helpers/world-screen-conversion.ts';

export class RectangleEntity implements Entity {
  public id: string = crypto.randomUUID();
  public lineColor: string = '#fff';
  public lineWidth: number = 1;

  private rectangle: Box | null = null;
  private startPoint: Point | null = null;

  constructor(startPoint?: Point, endPoint?: Point) {
    if (startPoint) {
      this.startPoint = startPoint;
    }
    if (startPoint && endPoint) {
      this.rectangle = new Box(
        Math.min(startPoint.x, endPoint.x),
        Math.min(startPoint.y, endPoint.y),
        Math.max(startPoint.x, endPoint.x),
        Math.max(startPoint.y, endPoint.y),
      );
    }
  }

  public send(point: Point): boolean {
    if (!this.startPoint) {
      this.startPoint = point;
      return false;
    } else if (!this.rectangle) {
      this.rectangle = new Box(
        Math.min(this.startPoint.x, point.x),
        Math.min(this.startPoint.y, point.y),
        Math.max(this.startPoint.x, point.x),
        Math.max(this.startPoint.y, point.y),
      );
      return true;
    }
    return true;
  }

  public draw(drawInfo: DrawInfo): void {
    if (!this.startPoint && !this.rectangle) {
      return;
    }

    let startPointTemp: Point;
    let endPointTemp: Point;
    if (this.rectangle) {
      // Draw the line between the 2 points
      startPointTemp = this.rectangle.high;
      endPointTemp = this.rectangle.low;
    } else {
      // Draw the line between the start point and the mouse
      startPointTemp = this.startPoint as Point;
      endPointTemp = new Point(
        drawInfo.worldMouseLocation.x,
        drawInfo.worldMouseLocation.y,
      );
    }

    const screenStartPoint = worldToScreen(startPointTemp);
    const screenEndPoint = worldToScreen(endPointTemp);

    drawInfo.context.beginPath();
    drawInfo.context.strokeRect(
      screenStartPoint.x,
      screenStartPoint.y,
      screenEndPoint.x - screenStartPoint.x,
      screenEndPoint.y - screenStartPoint.y,
    );
  }

  public intersectsWithBox(selectionBox: Box): boolean {
    if (!this.rectangle) {
      return false;
    }
    return Relations.relate(this.rectangle, selectionBox).B2B.length > 0;
  }

  public isContainedInBox(selectionBox: Box): boolean {
    if (!this.rectangle) {
      return false;
    }
    return selectionBox.contains(this.rectangle);
  }

  public distanceTo(shape: Shape): [number, Segment] | null {
    if (!this.rectangle) return null;
    const distanceInfos: [number, Segment][] = this.rectangle
      .toSegments()
      .map(segment => segment.distanceTo(shape));
    let shortestDistanceInfo: [number, Segment | null] = [
      Number.MAX_SAFE_INTEGER,
      null,
    ];
    distanceInfos.forEach(distanceInfo => {
      if (distanceInfo[0] < shortestDistanceInfo[0]) {
        shortestDistanceInfo = distanceInfo;
      }
    });
    return shortestDistanceInfo as [number, Segment];
  }

  public getBoundingBox(): Box | null {
    if (!this.rectangle) {
      return null;
    }
    return this.rectangle;
  }

  public getShape(): Shape | null {
    return this.rectangle;
  }

  public getSnapPoints(): SnapPoint[] {
    if (!this.rectangle) {
      return [];
    }
    const corners = this.rectangle.toPoints();
    const edges = this.rectangle.toSegments();
    return [
      {
        point: corners[0],
        type: SnapPointType.LineEndPoint,
      },
      {
        point: corners[1],
        type: SnapPointType.LineEndPoint,
      },
      {
        point: corners[2],
        type: SnapPointType.LineEndPoint,
      },
      {
        point: corners[3],
        type: SnapPointType.LineEndPoint,
      },
      {
        point: edges[0].middle(),
        type: SnapPointType.LineMidPoint,
      },
      {
        point: edges[1].middle(),
        type: SnapPointType.LineMidPoint,
      },
      {
        point: edges[2].middle(),
        type: SnapPointType.LineMidPoint,
      },
      {
        point: edges[3].middle(),
        type: SnapPointType.LineMidPoint,
      },
    ];
  }

  public getIntersections(entity: Entity): Point[] {
    const otherShape = entity.getShape();
    if (!this.rectangle || !otherShape) {
      return [];
    }
    return this.rectangle.toSegments().flatMap(segment => {
      return segment.intersect(otherShape);
    });
  }

  public getFirstPoint(): Point | null {
    return this.startPoint;
  }

  public getSvgString(): string | null {
    if (!this.rectangle) {
      return null;
    }
    return this.rectangle.svg({
      strokeWidth: this.lineWidth,
      stroke: this.lineColor,
    });
  }

  public getType(): EntityName {
    return EntityName.Rectangle;
  }

  public containsPointOnShape(point: Flatten.Point): boolean {
    if (!this.rectangle) {
      return false;
    }
    return this.rectangle.toSegments().some(segment => segment.contains(point));
  }

  public toJson(): JsonEntity<RectangleJsonData> | null {
    if (!this.rectangle) {
      return null;
    }
    return {
      id: this.id,
      type: EntityName.Rectangle,
      lineColor: this.lineColor,
      lineWidth: this.lineWidth,
      shapeData: {
        xmin: this.rectangle.xmin,
        ymin: this.rectangle.ymin,
        xmax: this.rectangle.xmax,
        ymax: this.rectangle.ymax,
      },
    };
  }

  public fromJson(jsonEntity: JsonEntity<RectangleJsonData>): RectangleEntity {
    const startPoint = new Point(
      jsonEntity.shapeData.xmin,
      jsonEntity.shapeData.ymin,
    );
    const endPoint = new Point(
      jsonEntity.shapeData.xmax,
      jsonEntity.shapeData.ymax,
    );
    const rectangleEntity = new RectangleEntity(startPoint, endPoint);
    rectangleEntity.id = jsonEntity.id;
    rectangleEntity.lineColor = jsonEntity.lineColor;
    rectangleEntity.lineWidth = jsonEntity.lineWidth;
    return rectangleEntity;
  }
}

export interface RectangleJsonData {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}
