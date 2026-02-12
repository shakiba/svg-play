import { Matrix, Vec2Value } from "../util/Matrix";
import { Factory } from "./factory";

export function convertEllipse(factory: Factory, node: any, xf: Matrix): void {
  const numberOfPoints = 16; // TODO as param

  const center = { x: node.$?.cx ?? 0, y: node.$?.cy ?? 0 };
  const radius = { x: node.$?.rx ?? node.$?.ry ?? 0, y: node.$?.ry ?? node.$?.rx ?? 0 };

  const likeCircle = Math.abs(radius.x - radius.y) < ((radius.x + radius.y) / 2) * 0.01;

  if (likeCircle) {
    const r = xf.mapX((radius.x + radius.y) / 2, 0);
    const c = xf.map(center);
    factory.circle(node, c, r);
  } else {
    const vertices = convertEllipseToPolygon(xf, center, radius, 16);
    factory.polygon(node, vertices);
  }
}

export const convertEllipseToPolygon = (
  xf: Matrix,
  center: { x: number; y: number },
  radius: { x: number; y: number },
  numberOfPoints = 16,
): Vec2Value[] => {
  const vertices: Vec2Value[] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const alpha = (i / numberOfPoints) * 2 * Math.PI;
    const v = {
      x: center.x + Math.cos(alpha) * radius.x,
      y: center.y + Math.sin(alpha) * radius.y,
    };
    xf.map(v, v);
    vertices.push(v);
  }
  return vertices;
};
