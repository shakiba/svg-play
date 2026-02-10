import * as geo from "../common/Geo";
import { getAngle } from "../util";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform0?: geo.TransformValue): void {
  let center = geo.vec2((node.$.x ?? 0) + node.$.width / 2, (node.$.y ?? 0) + node.$.height / 2);

  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  const transformProduct = geo.transform(0, 0, 0);
  geo.transformTransform(transformProduct, xf, transformProduct);

  geo.transformVec2(center, transformProduct, center);
  let angle = getAngle(Math.acos(transformProduct.q.c), Math.asin(transformProduct.q.s));

  factory.box(node, node.$.width, node.$.height, center, angle);
}
