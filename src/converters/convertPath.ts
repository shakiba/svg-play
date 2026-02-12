import {
  PathSegment,
  LineSegment,
  CubicBezierCurveSegment,
  QuadraticBezierCurveSegment,
  EllipticalArcCurveSegment,
} from "../parsers/interpretPath";
import { Factory } from "./factory";
import { Matrix, Vec2Value } from "../util/Matrix";

// TODO set ghost vertices

export function convertPath(factory: Factory, node: any, xf: Matrix): void {
  if (!node.$?.d) {
    return;
  }

  const vertices: Vec2Value[] = [];

  for (let segment of node.$.d as PathSegment[]) {
    xf.map(segment.startingPoint, segment.startingPoint);
    xf.map(segment.endPoint, segment.endPoint);

    switch (segment.type) {
      case "Line":
        vertices.push(segment.startingPoint, segment.endPoint);
        break;
      case "QuadraticBezierCurve":
        xf.map(segment.controlPoint, segment.controlPoint);
        vertices.push(...convertQuadraticBezierCurveSegment(segment));
        break;
      case "CubicBezierCurve":
        xf.map(segment.startControlPoint, segment.startControlPoint);
        xf.map(segment.endControlPoint, segment.endControlPoint);
        vertices.push(...convertCubicBezierCurveSegment(segment));
        break;
      case "EllipticalArcCurve":
        // TODO
        console.warn("Elliptical arc curves are not supported");
        break;
    }
  }

  if (vertices.length === 2) {
    factory.edge(node, vertices[0], vertices[1]);
  } else if (vertices.length > 2) {
    factory.chain(node, vertices);
  }
}

function convertQuadraticBezierCurveSegment(s: QuadraticBezierCurveSegment, numberOfPoints = 7) {
  const vertices: Vec2Value[] = [];
  // De-Casteljau-algorithm
  for (let i = 0; i < numberOfPoints; i++) {
    const t = i / (numberOfPoints - 1);
    const mt = 1 - t;
    const vertex = { x: 0, y: 0 };
    vertex.x = mt * mt * s.startingPoint.x + 2 * mt * t * s.controlPoint.x + t * t * s.endPoint.x;
    vertex.y = mt * mt * s.startingPoint.y + 2 * mt * t * s.controlPoint.y + t * t * s.endPoint.y;
    vertices.push(vertex);
  }
  return vertices;
}

function convertCubicBezierCurveSegment(s: CubicBezierCurveSegment, numberOfPoints = 7) {
  // De-Casteljau-algorithm
  const vertices: Vec2Value[] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const t = i / (numberOfPoints - 1);
    const mt = 1 - t;
    const vertex = { x: 0, y: 0 };
    vertex.x =
      mt * mt * mt * s.startingPoint.x +
      3 * mt * mt * t * s.startControlPoint.x +
      3 * mt * t * t * s.endControlPoint.x +
      t * t * t * s.endPoint.x;
    vertex.y =
      mt * mt * mt * s.startingPoint.y +
      3 * mt * mt * t * s.startControlPoint.y +
      3 * mt * t * t * s.endControlPoint.y +
      t * t * t * s.endPoint.y;
    vertices.push(vertex);
  }
  return vertices;
}

function convertEllipticalArcCurveSegment(segment: EllipticalArcCurveSegment) {
  // todo
  return [];
}
