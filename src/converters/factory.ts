import * as geo from "../common/Geo";

import { isShape } from "../util";
import {
  convertCircle,
  convertLine,
  convertPolygon,
  convertPolyline,
  convertRect,
} from "../converters";
import convertEllipse from "../converters/convertEllipse";
import convertPath from "../converters/convertPath";

export interface Factory {
  polygon: (node: any, vertices: geo.Vec2Value[]) => void;
  circle: (node: any, p: geo.Vec2Value, radius: number) => void;
  chain: (node: any, points: geo.Vec2Value[]) => void;
  edge: (node: any, p1: geo.Vec2Value, p2: geo.Vec2Value) => void;
  box: (node: any, width: number, height: number, center: geo.Vec2Value, angle: number) => void;
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
