import { Transform, Vec2 } from "planck";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform?: Transform): void {
  let points = (node.$?.points ?? []) as Vec2[];

  points = points.map((point) =>
    [transform, node.$.transform, point].filter((a) => a).reduce(Transform.mul),
  );

  factory.polygon(node, points);
}
