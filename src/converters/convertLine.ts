import { Transform, Vec2 } from "planck";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform?: Transform): void {
  let point1 = Vec2(node.$?.x1 ?? 0, node.$?.y1 ?? 0);
  let point2 = Vec2(node.$?.x2 ?? 0, node.$?.y2 ?? 0);

  point1 = [transform, node.$.transform, point1].filter((a) => a).reduce(Transform.mul);
  point2 = [transform, node.$.transform, point2].filter((a) => a).reduce(Transform.mul);

  factory.edge(node, point1, point2);
}
