import * as geo from "../util/Geo";

import { isShape } from "../util/isShape";
import { convertCircle } from "./convertCircle";
import { convertEllipse } from "./convertEllipse";
import { convertLine } from "./convertLine";
import { convertPath } from "./convertPath";
import { convertPolygon } from "./convertPolygon";
import { convertPolyline } from "./convertPolyline";
import { convertRect } from "./convertRect";

export interface Factory {
  polygon: (node: any, vertices: { x: number; y: number }[]) => void;
  circle: (node: any, p: { x: number; y: number }, radius: number) => void;
  chain: (node: any, points: { x: number; y: number }[]) => void;
  edge: (node: any, p1: { x: number; y: number }, p2: { x: number; y: number }) => void;
  box: (
    node: any,
    width: number,
    height: number,
    center: { x: number; y: number },
    angle: number,
  ) => void;
}

export function transformTree(factory: Factory, node: any, transform0 = geo.transform(0, 0, 0)) {
  if (isShape(node)) {
    switch (node["#name"].toLowerCase()) {
      case "circle":
        return convertCircle(factory, node, transform0);
      case "ellipse":
        return convertEllipse(factory, node, transform0);
      case "line":
        return convertLine(factory, node, transform0);
      case "path":
        return convertPath(factory, node, transform0);
      case "polygon":
        return convertPolygon(factory, node, transform0);
      case "polyline":
        return convertPolyline(factory, node, transform0);
      case "rect":
        return convertRect(factory, node, transform0);
      default:
        // invalid shape type, ignore
        return [];
    }
  } else if (node.$$) {
    const xf = geo.transform(0, 0, 0);
    if (transform0) geo.transformTransform(xf, xf, transform0);
    if (node.$?.transform) geo.transformTransform(xf, xf, node.$.transform);

    for (let child of node.$$) {
      transformTree(factory, child, xf);
    }
  }
}
