import * as geo from "../util/Geo";
import { PathSegment } from "../parsers/interpretPath";
import { getAngle } from "../util/getAngle";
import { mat33ToTransform } from "./mat33ToTransform";
import { mat33mul } from "./mat33mul";

const EPSILON = 1e-1;

export function applyMat33ToShape(node: any, A: geo.Mat33Value | null) {
  if (!A) {
    return;
  }
  if (!node.$) {
    node.$ = {};
  }
  if (node.$.transform) {
    A = mat33mul(A, node.$.transform);
  }
  const { transform, overhang } = mat33ToTransform(A);

  node.$.transform = transform;
  if (!overhang) {
    return;
  }

  switch (node["#name"].toLowerCase()) {
    case "rect":
      rect2polygon(node);
    /* FALLTHROUGH */
    case "polygon":
    case "polyline":
      if (node.$.points) {
        node.$.points = node.$.points.map((point: geo.Vec2Value) => {
          return matt33mulVec2(overhang, point);
        });
      }
      break;

    case "circle":
      circle2ellipse(node);
    /* FALLTHROUGH */
    case "ellipse":
      applyMat33ToEllipse(node, overhang);
      ellipse2circle(node);
      break;

    case "line":
      applyMat33ToLine(node, overhang);
      break;

    case "path":
      applyMat33ToPath(node, overhang);
      break;

    default:
      throw new Error(`<${node["#name"]}> tag is not supported`);
  }
}

function rect2polygon(node: any) {
  node["#name"] = "polygon";

  const hx = node.$.width / 2;
  const hy = node.$.height / 2;
  const cx = (node.$.x ?? 0) + hx;
  const cy = (node.$.y ?? 0) + hy;

  node.$.points = [
    geo.vec2(cx + hx, cy - hy),
    geo.vec2(cx + hx, cy + hy),
    geo.vec2(cx - hx, cy + hy),
    geo.vec2(cx - hx, cy - hy),
  ];
}

function matt33mulVec2(A: geo.Mat33Value, point: geo.Vec2Value) {
  const p = geo.vec3(0, 0, 0);
  geo.mulMat33Vec3(p, A, geo.vec3(point.x, point.y, 1));
  return geo.vec2(p.x, p.y);
}

function circle2ellipse(node: any) {
  node["#name"] = "ellipse";

  node.$.rx = node.$.r;
  node.$.ry = node.$.r;
}

function applyMat33ToEllipse(node: any, A: geo.Mat33Value) {
  // see https://en.wikipedia.org/wiki/Ellipse#General_ellipse_2

  const center = geo.vec3(0, 0, 0);
  geo.mulMat33Vec3(center, A, geo.vec3(node.$.cx ?? 0, node.$.cy ?? 0, 1));

  geo.mulVec3(A.ex, node.$.rx ?? node.$.ry ?? 0);
  geo.mulVec3(A.ey, node.$.ry ?? node.$.rx ?? 0);

  const x = (2 * geo.dotVec3(A.ex, A.ey)) / (geo.dotVec3(A.ex, A.ex) - geo.dotVec3(A.ey, A.ey));
  const t_0 = Number.isNaN(x) ? 0 : Math.atan(x) / 2;

  const p = (t: number) => {
    // todo: simplify this
    const a = geo.vec3(A.ex.x, A.ex.y, A.ex.z);
    geo.mulVec3(a, Math.cos(t));
    const b = geo.vec3(A.ey.x, A.ey.y, A.ey.z);
    geo.mulVec3(b, Math.sin(t));
    const result = geo.vec3(0, 0, 0);
    geo.addVec3(result, a, b);
    return result;
  };

  const verticeA = p(t_0);
  node.$.rx = Math.hypot(verticeA.x, verticeA.y);

  const verticeB = p(t_0 + Math.PI / 2);
  node.$.ry = Math.hypot(verticeB.x, verticeB.y);

  const length = Math.hypot(verticeA.x, verticeA.y);
  const alpha =
    length !== 0 ? getAngle(Math.acos(verticeA.x / length), Math.asin(verticeA.y / length)) : 0;

  geo.transformTransform(
    node.$.transform,
    node.$.transform,
    geo.transform(center.x, center.y, alpha),
  );
  node.$.cx = 0;
  node.$.cy = 0;
}

function ellipse2circle(node: any) {
  if (Math.abs(node.$.rx - node.$.ry) < EPSILON) {
    node["#name"] = "circle";
    node.$.r = node.$.rx;
  }
}

function applyMat33ToLine(node: any, A: geo.Mat33Value) {
  const point1 = geo.vec3(0, 0, 0);
  geo.mulMat33Vec3(point1, A, geo.vec3(node.$.x1 ?? 0, node.$.y1 ?? 0, 1));
  const point2 = geo.vec3(0, 0, 0);
  geo.mulMat33Vec3(point2, A, geo.vec3(node.$.x2 ?? 0, node.$.y2 ?? 0, 1));

  node.$.x1 = point1.x;
  node.$.y1 = point1.y;
  node.$.x2 = point2.x;
  node.$.y2 = point2.y;
}

function applyMat33ToPath(node: any, A: geo.Mat33Value) {
  if (!node.$.d) {
    return;
  }
  for (let segment of node.$.d as PathSegment[]) {
    segment.startingPoint = matt33mulVec2(A, segment.startingPoint);
    segment.endPoint = matt33mulVec2(A, segment.endPoint);

    switch (segment.type) {
      case "CubicBezierCurve":
        segment.startControlPoint = matt33mulVec2(A, segment.startControlPoint);
        segment.endControlPoint = matt33mulVec2(A, segment.endControlPoint);
        break;
      case "QuadraticBezierCurve":
        segment.controlPoint = matt33mulVec2(A, segment.controlPoint);
        break;
      case "EllipticalArcCurve":
        // TODO
        console.warn("Elliptical arc curves are not supported");
        break;
    }
  }
}
