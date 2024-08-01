import { Entity } from '../entities/Entitity.ts';
import { SVG_MARGIN } from '../App.consts.ts';
import { Point, Vector } from '@flatten-js/core';
import { Shape } from '../App.types.ts';

export function convertEntitiesToSvgString(
  entities: Entity[],
  canvasSize: Point,
): string {
  let boundingBoxMinX = canvasSize.x;
  let boundingBoxMinY = canvasSize.y;
  let boundingBoxMaxX = 0;
  let boundingBoxMaxY = 0;
  const svgStrings: string[] = [];

  entities.forEach(entity => {
    const boundingBox = entity.getBoundingBox();
    if (boundingBox) {
      boundingBoxMinX = Math.min(boundingBoxMinX, boundingBox.xmin);
      boundingBoxMinY = Math.min(boundingBoxMinY, boundingBox.ymin);
      boundingBoxMaxX = Math.max(boundingBoxMaxX, boundingBox.xmax);
      boundingBoxMaxY = Math.max(boundingBoxMaxY, boundingBox.ymax);
    }
  });

  console.log('exporting svg', svgStrings);
  const boundingBoxWidth = boundingBoxMaxX - boundingBoxMinX + SVG_MARGIN * 2;
  const boundingBoxHeight = boundingBoxMaxY - boundingBoxMinY + SVG_MARGIN * 2;

  entities.forEach(entity => {
    const shape = entity.getShape();
    if (!shape) return;

    const translatedShape = shape.translate(
      new Vector(
        new Point(boundingBoxMinX, boundingBoxMinY),
        new Point(SVG_MARGIN, SVG_MARGIN),
      ),
    );
    const svgString = (translatedShape as Shape).svg();
    if (svgString) {
      svgStrings.push(svgString);
    }
  });

  // Patch for bug: https://github.com/alexbol99/flatten-js/pull/186/files
  return `
      <svg width="${boundingBoxWidth}" height="${boundingBoxHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${boundingBoxWidth}" height="${boundingBoxHeight}" fill="white" />
        ${svgStrings
          .join('')
          ?.replace(/width=([0-9]+)/g, 'width="$1"')
          ?.replace(/height=([0-9]+)/g, 'height="$1"')}
      </svg>
    `;
}
