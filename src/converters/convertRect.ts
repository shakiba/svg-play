import { Transform, Vec2 } from "planck";
import { getAngle } from "../util";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform?: Transform): void {
  let center = Vec2((node.$.x ?? 0) + node.$.width / 2, (node.$.y ?? 0) + node.$.height / 2);

  const transformProduct = [transform, node.$.transform]
    .filter((a) => a)
    .reduce(Transform.mul, Transform.identity());

  center = Transform.mul(transformProduct, center);
  let angle = getAngle(Math.acos(transformProduct.q.c), Math.asin(transformProduct.q.s));

  factory.box(node, node.$.width, node.$.height, center, angle);
}
