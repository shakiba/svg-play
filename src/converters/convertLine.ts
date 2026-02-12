import { Matrix } from "../util/Matrix";
import { Factory } from "./factory";

export function convertLine(factory: Factory, node: any, xf: Matrix): void {
  let point1 = { x: node.$?.x1 ?? 0, y: node.$?.y1 ?? 0 };
  xf.map(point1, point1);

  let point2 = { x: node.$?.x2 ?? 0, y: node.$?.y2 ?? 0 };
  xf.map(point2, point2);

  factory.edge(node, point1, point2);
}
