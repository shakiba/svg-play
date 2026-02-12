import { isShape } from "../util/isShape";
import { Matrix } from "../util/Matrix";
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

export function transformTree(factory: Factory, node: any, transform0?: Matrix) {
    const xf = new Matrix();
    if (node.$?.transform) xf.concat(node.$.transform);
    if (transform0) xf.concat(transform0);

    if (isShape(node)) {
    switch (node["#name"].toLowerCase()) {
      case "circle":
        return convertCircle(factory, node, xf);
      case "ellipse":
        return convertEllipse(factory, node, xf);
      case "line":
        return convertLine(factory, node, xf);
      case "path":
        return convertPath(factory, node, xf);
      case "polygon":
        return convertPolygon(factory, node, xf);
      case "polyline":
        return convertPolyline(factory, node, xf);
      case "rect":
        return convertRect(factory, node, xf);
      default:
        // invalid shape type, ignore
        return [];
    }
  } else if (node.$$) {

    for (let child of node.$$) {
      transformTree(factory, child, xf);
    }
  }
}
