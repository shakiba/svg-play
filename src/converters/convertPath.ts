import { Transform, Vec2 } from "planck";
import {
  PathSegment,
  LineSegment,
  CubicBezierCurveSegment,
  QuadraticBezierCurveSegment,
  EllipticalArcCurveSegment,
} from "../parsers/interpretPath";
import { Factory } from "./factory";

// TODO set ghost vertices

export default function (factory: Factory, node: any, transform?: Transform): void {
  transform = (
    [transform, <Transform>node.$.transform, Transform.identity()].filter((a) => a) as Transform[]
  ).reduce(Transform.mul);

  if (!node.$?.d) {
    return;
  }
  for (let segment of node.$.d as PathSegment[]) {
    segment.startingPoint = Transform.mul(transform, segment.startingPoint);
    segment.endPoint = Transform.mul(transform, segment.endPoint);

    switch (segment.type) {
      case "CubicBezierCurve":
        segment.startControlPoint = Transform.mul(transform, segment.startControlPoint);
        segment.endControlPoint = Transform.mul(transform, segment.endControlPoint);
        break;
      case "QuadraticBezierCurve":
        segment.controlPoint = Transform.mul(transform, segment.controlPoint);
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

function convertLineSegment(node, factory: Factory, segment: LineSegment): void {
  factory.edge(node, segment.startingPoint, segment.endPoint);
}

function convertQuadraticBezierCurveSegment(
  node,
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
      .map((t) =>
        Vec2.combine(
          1 - t,
          Vec2.combine(1 - t, s.startingPoint, t, s.controlPoint),
          t,
          Vec2.combine(1 - t, s.controlPoint, t, s.endPoint),
        ),
      ),
  );
}

function convertCubicBezierCurveSegment(node, factory: Factory, s: CubicBezierCurveSegment): void {
  const numberOfPoints = 7; // TODO as param
  // De-Casteljau-algorithm
  factory.chain(
    node,
    Array(numberOfPoints)
      .fill(0)
      .map((_, index) => index / (numberOfPoints - 1))
      .map((t) =>
        Vec2.combine(
          1 - t,
          Vec2.combine(
            1 - t,
            Vec2.combine(1 - t, s.startingPoint, t, s.startControlPoint),
            t,
            Vec2.combine(1 - t, s.startControlPoint, t, s.endControlPoint),
          ),
          t,
          Vec2.combine(
            1 - t,
            Vec2.combine(1 - t, s.startControlPoint, t, s.endControlPoint),
            t,
            Vec2.combine(1 - t, s.endControlPoint, t, s.endPoint),
          ),
        ),
      ),
  );
}

function convertEllipticalArcCurveSegment(
  node,
  factory: Factory,
  segment: EllipticalArcCurveSegment,
): void {
  // TODO
  factory.chain(node, []);
}
