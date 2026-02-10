import * as geo from "../util/Geo";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  let point1 = geo.vec2(node.$?.x1 ?? 0, node.$?.y1 ?? 0);
  geo.transformVec2(point1, xf, point1);

  let point2 = geo.vec2(node.$?.x2 ?? 0, node.$?.y2 ?? 0);
  geo.transformVec2(point2, xf, point2);

  factory.edge(node, point1, point2);
}
