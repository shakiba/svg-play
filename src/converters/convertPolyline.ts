import { Matrix, Vec2Value } from "../util/Matrix";
import { Factory } from "./factory";

export function convertPolyline(factory: Factory, node: any, xf: Matrix): void {
  let points = (node.$?.points ?? []) as Vec2Value[];
  points = points.map((point) => {
    const p = { x: point.x, y: point.y };
    xf.map(p, p);
    return p;
  });

  factory.chain(node, points);
}
