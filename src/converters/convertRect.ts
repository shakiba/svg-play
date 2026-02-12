import { Matrix } from "../util/Matrix";
import { Factory } from "./factory";

export function convertRect(factory: Factory, node: any, xf: Matrix): void {
  const width = node.$.width ?? 0;
  const height = node.$.height ?? 0;
  const x = node.$.x ?? 0;
  const y = node.$.y ?? 0;

  let vertices = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height },
  ];

  vertices.map((point) => {
    xf.map(point, point);
  });

  factory.polygon(node, vertices);
}
