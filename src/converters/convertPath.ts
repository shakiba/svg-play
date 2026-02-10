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

export default function (factory: Factory, node: any, transform0?: Transform): void {
  const xf = geo.transform(0, 0, 0);
  if (transform0) geo.transformTransform(xf, xf, transform0);
  if (node.$.transform) geo.transformTransform(xf, xf, node.$.transform);

  const transform = geo.transform(0, 0, 0);
  geo.transformTransform(transform, xf, transform);

  if (!node.$?.d) {
    return;
  }
  for (let segment of node.$.d as PathSegment[]) {
    geo.transformVec2(segment.startingPoint, transform, segment.startingPoint);
    geo.transformVec2(segment.endPoint, transform, segment.endPoint);

    switch (segment.type) {
      case "CubicBezierCurve":
        geo.transformVec2(segment.startControlPoint, transform, segment.startControlPoint);
        geo.transformVec2(segment.endControlPoint, transform, segment.endControlPoint);
        break;
      case "QuadraticBezierCurve":
        geo.transformVec2(segment.controlPoint, transform, segment.controlPoint);
        break;
      case "EllipticalArcCurve":
        // TODO
        console.warn("Elliptical arc curves are not supported");
        break;
    }
  }

  (<PathSegment[]>node.$.d).map((segment) => {
    switch (segment.type) {
      case "Line":
        return convertLineSegment(node, factory, segment);
      case "QuadraticBezierCurve":
        return convertQuadraticBezierCurveSegment(node, factory, segment);
      case "CubicBezierCurve":
        return convertCubicBezierCurveSegment(node, factory, segment);
      case "EllipticalArcCurve":
        return convertEllipticalArcCurveSegment(node, factory, segment);
    }
  });
}

function convertLineSegment(node: any, factory: Factory, segment: LineSegment): void {
  factory.edge(node, segment.startingPoint, segment.endPoint);
}

function convertQuadraticBezierCurveSegment(
  node: any,
  factory: Factory,
  s: QuadraticBezierCurveSegment,
): void {
  const numberOfPoints = 7; // TODO as param
  // De-Casteljau-algorithm
  factory.chain(
    node,
    Array(numberOfPoints)
      .fill(0)
      .map((_, index) => index / (numberOfPoints - 1))
      .map((t) => {
        const mt = 1 - t;
        const temp = geo.vec2(0, 0);
        geo.combine4Vec2(
          temp,
          mt * mt,
          s.startingPoint,
          mt * t,
          s.controlPoint,
          t * mt,
          s.controlPoint,
          t * t,
          s.endPoint,
        );
        return temp;
      }),
  );
}

function convertCubicBezierCurveSegment(
  node: any,
  factory: Factory,
  s: CubicBezierCurveSegment,
): void {
  const numberOfPoints = 7; // TODO as param
  // De-Casteljau-algorithm
  factory.chain(
    node,
    Array(numberOfPoints)
      .fill(0)
      .map((_, index) => index / (numberOfPoints - 1))
      .map((t) => {
        const mt = 1 - t;
        const temp = geo.vec2(0, 0);
        geo.combine4Vec2(
          temp,
          mt * mt * mt,
          s.startingPoint,
          3 * mt * mt * t,
          s.startControlPoint,
          3 * mt * t * t,
          s.endControlPoint,
          t * t * t,
          s.endPoint,
        );
        return temp;
      }),
  );
}

function convertEllipticalArcCurveSegment(
  node: any,
  factory: Factory,
  segment: EllipticalArcCurveSegment,
): void {
  // TODO
  factory.chain(node, []);
}
