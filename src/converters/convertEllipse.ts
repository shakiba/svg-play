import * as geo from "../util/Geo";
import { Factory } from "./factory";

export function convertEllipse(factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const numberOfPoints = 16; // TODO as param

  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  const center = { x: node.$?.cx ?? 0, y: node.$?.cy ?? 0 };
  const radius = { x: node.$?.rx ?? node.$?.ry ?? 0, y: node.$?.ry ?? node.$?.rx ?? 0 };
  const vertices = convertEllipseToPolygon(xf, center, radius, 16);

  factory.polygon(node, vertices);
}

export const convertEllipseToPolygon = (
  xf: geo.TransformValue,
  center: { x: number; y: number },
  radius: { x: number; y: number },
  numberOfPoints = 16,
): geo.Vec2Value[] => {
  const position = geo.transform(center.x, center.y, 0);
  geo.transformTransform(position, xf, position);

  const vertices: geo.Vec2Value[] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const alpha = (i / numberOfPoints) * 2 * Math.PI;
    const v = geo.vec2(Math.cos(alpha) * radius.x, Math.sin(alpha) * radius.y);
    geo.transformVec2(v, position, v);
    vertices.push(v);
  }
  return vertices;
};
