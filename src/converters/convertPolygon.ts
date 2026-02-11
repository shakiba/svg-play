import * as geo from "../util/Geo";
import { Factory } from "./factory";

export function convertPolygon(factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  let points = (node.$?.points ?? []) as geo.Vec2Value[];
  points = points.map((point) => {
    const p = geo.vec2(point.x, point.y);
    geo.transformVec2(p, xf, p);
    return p;
  });

  factory.polygon(node, points);
}
