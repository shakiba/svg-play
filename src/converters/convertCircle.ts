import { Transform, Vec2 } from "planck";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform?: Transform): void {
  let position = Vec2(node.$?.cx ?? 0, node.$?.cy ?? 0);

  position = [transform, node.$.transform, position].filter((a) => a).reduce(Transform.mul);

  factory.circle(node, position, node.$?.r ?? 0);
}
