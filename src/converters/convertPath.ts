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
    switch (segment.type) {
      case "Line":
        vertices.push(segment.startingPoint, segment.endPoint);
        break;
      case "QuadraticBezierCurve":
        vertices.push(...convertQuadraticBezierCurveSegment(segment));
        break;
      case "CubicBezierCurve":
        vertices.push(...convertCubicBezierCurveSegment(segment));
        break;
      case "EllipticalArcCurve":
        vertices.push(...convertEllipticalArcCurveSegment(segment));
        break;
    }
  }

  for (let v of vertices) {
    xf.map(v, v);
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

// ai generated
function convertEllipticalArcCurveSegment(
  s: EllipticalArcCurveSegment,
  numberOfPointsDefault = 16,
): Vec2Value[] {
  const x1 = s.startingPoint.x;
  const y1 = s.startingPoint.y;
  const x2 = s.endPoint.x;
  const y2 = s.endPoint.y;

  let rx = Math.abs(s.rx);
  let ry = Math.abs(s.ry);
  const phi = (s.angle * Math.PI) / 180;

  if (rx === 0 || ry === 0) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let lambda = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2;
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const x1p2 = x1p * x1p;
  const y1p2 = y1p * y1p;

  let num = rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2;
  num = Math.max(0, num);

  const den = rx2 * y1p2 + ry2 * x1p2;
  const safeDen = Math.max(den, 1e-12);

  const sign = s.largeArcFlag === s.sweepFlag ? -1 : 1;
  const sqrtTerm = Math.sqrt(num / safeDen);
  const coef = sign * sqrtTerm;

  const cxp = (coef * (rx * y1p)) / ry;
  const cyp = (coef * (-ry * x1p)) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  let theta = Math.atan2(uy, ux);

  const cross = ux * vy - uy * vx;
  const dot = ux * vx + uy * vy;
  let delta = Math.atan2(cross, dot);

  delta = delta % (2 * Math.PI);
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;

  if (!s.sweepFlag && delta > 0) {
    delta -= 2 * Math.PI;
  } else if (s.sweepFlag && delta < 0) {
    delta += 2 * Math.PI;
  }

  const absDelta = Math.abs(delta);

  const angleStepTarget = Math.PI / 12; // ~15° base – reasonable quality
  let segments = Math.ceil(absDelta / angleStepTarget);
  const radiusFactor = Math.sqrt(rx * ry) / 100;
  segments = Math.ceil(segments * (1 + radiusFactor * 0.3));

  const n = Math.max(numberOfPointsDefault, segments + 1); // points = segments + 1

  const vertices: Vec2Value[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = theta + t * delta;

    const cosAng = Math.cos(ang);
    const sinAng = Math.sin(ang);

    const x = cx + rx * (cosPhi * cosAng - sinPhi * sinAng);
    const y = cy + ry * (sinPhi * cosAng + cosPhi * sinAng);

    vertices.push({ x, y });
  }

  return vertices;
}
