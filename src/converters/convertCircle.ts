import { Matrix } from "../util/Matrix";
import { Factory } from "./factory";

export function convertCircle(factory: Factory, node: any, xf: Matrix): void {
  let position = { x: node.$?.cx ?? 0, y: node.$?.cy ?? 0 };
  xf.map(position, position);

  const r = (node.$?.r ?? 0) * xf.a;

  factory.circle(node, position, r);
}
