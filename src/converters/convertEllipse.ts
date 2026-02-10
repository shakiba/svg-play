import * as geo from "../util/Geo";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const numberOfPoints = 16; // TODO as param

  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  const position = geo.transform(node.$?.cx ?? 0, node.$?.cy ?? 0, 0);
  geo.transformTransform(position, xf, position);

  let vertices = Array(numberOfPoints)
    .fill(0)
    .map((_, index) => (index / numberOfPoints) * 2 * Math.PI)
    .map((alpha) =>
      geo.vec2(
        Math.cos(alpha) * (node.$?.rx ?? node.$?.ry ?? 0),
        Math.sin(alpha) * (node.$?.ry ?? node.$?.rx ?? 0),
      ),
    )
    .map((p) => {
      geo.transformVec2(p, position, p);
      return p;
    });

  factory.polygon(node, vertices);
}
