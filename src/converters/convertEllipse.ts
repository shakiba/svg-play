import * as geo from "../util/Geo";
import { Factory } from "./factory";

export default function (factory: Factory, node: any, transform0?: geo.TransformValue): void {
  const numberOfPoints = 12; // TODO as param

  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  const position = geo.vec2(node.$?.cx ?? 0, node.$?.cy ?? 0);
  geo.transformVec2(position, xf, position);

  const transformation = geo.transform(position.x, position.y, 0);
  geo.transformTransform(transformation, xf, transformation);

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
      geo.transformVec2(p, transformation, p);
      return p;
    });

  factory.polygon(node, vertices);
}
