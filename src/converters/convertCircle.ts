import * as geo from "../util/Geo";
import { Factory } from "./factory";

export function convertCircle(factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  let position = geo.vec2(node.$?.cx ?? 0, node.$?.cy ?? 0);
  geo.transformVec2(position, xf, position);

  factory.circle(node, position, node.$?.r ?? 0);
}
