import { Transform, Vec2 } from "planck";

import { isShape } from "../util";
import { convertCircle, convertLine, convertPolygon, convertPolyline, convertRect } from ".";
import convertEllipse from "./convertEllipse";
import convertPath from "./convertPath";

export interface Factory {
  polygon: (node: any, vertices: Vec2[]) => void;
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

export function transformTree(factory: Factory, node: any, transform = Transform.identity()) {
  if (isShape(node)) {
    switch (node["#name"].toLowerCase()) {
      case "circle":
        return convertCircle(factory, node, transform);
      case "ellipse":
        return convertEllipse(factory, node, transform);
      case "line":
        return convertLine(factory, node, transform);
      case "path":
        return convertPath(factory, node, transform);
      case "polygon":
        return convertPolygon(factory, node, transform);
      case "polyline":
        return convertPolyline(factory, node, transform);
      case "rect":
        return convertRect(factory, node, transform);
      default:
        // invalid shape type, ignore
        return [];
    }
  } else if (node.$$) {
    if (node.$?.transform) {
      transform = Transform.mul(transform, <Transform>node.$.transform);
    }
    for (let child of node.$$) {
      transformTree(factory, child, transform);
    }
  }
}
