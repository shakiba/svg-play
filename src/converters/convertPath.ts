import * as geo from "../util/Geo";
import {
  PathSegment,
  LineSegment,
  CubicBezierCurveSegment,
  QuadraticBezierCurveSegment,
  EllipticalArcCurveSegment,
} from "../parsers/interpretPath";
import { Factory } from "./factory";

type Transform = geo.TransformValue;

// TODO set ghost vertices

export function convertPath(factory: Factory, node: any, transform0?: Transform): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  if (!node.$?.d) {
    return;
  }

  const vertices: geo.Vec2Value[] = [];

  for (let segment of node.$.d as PathSegment[]) {
    geo.transformVec2(segment.startingPoint, xf, segment.startingPoint);
    geo.transformVec2(segment.endPoint, xf, segment.endPoint);

    switch (segment.type) {
      case "Line":
        vertices.push(segment.startingPoint, segment.endPoint);
        break;
      case "QuadraticBezierCurve":
        geo.transformVec2(segment.controlPoint, xf, segment.controlPoint);
        vertices.push(...convertQuadraticBezierCurveSegment(segment));
        break;
      case "CubicBezierCurve":
        geo.transformVec2(segment.startControlPoint, xf, segment.startControlPoint);
        geo.transformVec2(segment.endControlPoint, xf, segment.endControlPoint);
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
  const vertices: geo.Vec2Value[] = [];
  // De-Casteljau-algorithm
  for (let i = 0; i < numberOfPoints; i++) {
    const t = i / (numberOfPoints - 1);
    const mt = 1 - t;
    const vertex = geo.vec2(0, 0);
    geo.combine4Vec2(
      vertex,
      mt * mt,
      s.startingPoint,
      mt * t,
      s.controlPoint,
      t * mt,
      s.controlPoint,
      t * t,
      s.endPoint,
    );
    vertices.push(vertex);
  }
  return vertices;
}

function convertCubicBezierCurveSegment(s: CubicBezierCurveSegment, numberOfPoints = 7) {
  // De-Casteljau-algorithm
  const vertices: geo.Vec2Value[] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const t = i / (numberOfPoints - 1);
    const mt = 1 - t;
    const vertex = geo.vec2(0, 0);
    geo.combine4Vec2(
      vertex,
      mt * mt * mt,
      s.startingPoint,
      3 * mt * mt * t,
      s.startControlPoint,
      3 * mt * t * t,
      s.endControlPoint,
      t * t * t,
      s.endPoint,
    );
    vertices.push(vertex);
  }
  return vertices;
}

function convertEllipticalArcCurveSegment(segment: EllipticalArcCurveSegment) {
  // todo
  return [];
}
