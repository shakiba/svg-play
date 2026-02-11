import * as geo from "../util/Geo";
import { getAngle } from "../util/getAngle";
import { Factory } from "./factory";

export function convertRect(factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  let center = geo.vec2((node.$.x ?? 0) + node.$.width / 2, (node.$.y ?? 0) + node.$.height / 2);
  geo.transformVec2(center, xf, center);
  let angle = getAngle(Math.acos(xf.q.c), Math.asin(xf.q.s));

  factory.box(node, node.$.width, node.$.height, center, angle);
}
