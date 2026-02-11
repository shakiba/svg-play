import * as geo from "../util/Geo";
import { Command } from "./parsePath";

export type LineSegment = {
  type: "Line";
  startingPoint: geo.Vec2Value;
  endPoint: geo.Vec2Value;
};
export type CubicBezierCurveSegment = {
  type: "CubicBezierCurve";
  startingPoint: geo.Vec2Value;
  endPoint: geo.Vec2Value;
  startControlPoint: geo.Vec2Value;
  endControlPoint: geo.Vec2Value;
};
export type QuadraticBezierCurveSegment = {
  type: "QuadraticBezierCurve";
  startingPoint: geo.Vec2Value;
  endPoint: geo.Vec2Value;
  controlPoint: geo.Vec2Value;
};
export type EllipticalArcCurveSegment = {
  type: "EllipticalArcCurve";
  startingPoint: geo.Vec2Value;
  rx: number;
  ry: number;
  angle: number;
  largeArcFlag: 0 | 1;
  sweepFlag: 0 | 1;
  endPoint: geo.Vec2Value;
};
export type PathSegment =
  | LineSegment
  | CubicBezierCurveSegment
  | QuadraticBezierCurveSegment
  | EllipticalArcCurveSegment;

export function interpretPath(commands: Command[]): PathSegment[] {
  let result = [] as PathSegment[];

  let start = commands.shift();
  if (start?.letter !== "M" && start?.letter !== "m") {
    return [];
  }

  let currentPoint = geo.vec2(start.parameters[0], start.parameters[1]);
  let cubicStartControlPoint = currentPoint;
  let quadraticControlPoint = currentPoint;
  let initialPoint = currentPoint;

  for (let command of commands) {
    let endPoint: geo.Vec2Value;
    let endControlPoint: geo.Vec2Value;
    switch (command.letter) {
      case "M":
      case "m":
        endPoint = geo.vec2(command.parameters[0], command.parameters[1]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(endPoint, endPoint, currentPoint);
        }
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        quadraticControlPoint = endPoint;
        initialPoint = endPoint;
        break;

      case "L":
      case "l":
      case "H":
      case "h":
      case "V":
      case "v":
        endPoint = getAbsoluteLineEndPoint(command, currentPoint);
        result.push({
          type: "Line",
          startingPoint: geo.vec2(currentPoint.x, currentPoint.y),
          endPoint: geo.vec2(endPoint.x, endPoint.y),
        });
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        quadraticControlPoint = endPoint;
        break;

      case "C":
      case "c":
        cubicStartControlPoint = geo.vec2(command.parameters[0], command.parameters[1]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(cubicStartControlPoint, cubicStartControlPoint, currentPoint);
        }
        command.parameters = command.parameters.slice(2);
      /* FALLTHROUGH */
      case "S":
      case "s":
        endControlPoint = geo.vec2(command.parameters[0], command.parameters[1]);
        endPoint = geo.vec2(command.parameters[2], command.parameters[3]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(endControlPoint, endControlPoint, currentPoint);
          geo.addVec2(endPoint, endPoint, currentPoint);
        }
        result.push({
          type: "CubicBezierCurve",
          startingPoint: geo.vec2(currentPoint.x, currentPoint.y),
          startControlPoint: geo.vec2(cubicStartControlPoint.x, cubicStartControlPoint.y),
          endControlPoint: geo.vec2(endControlPoint.x, endControlPoint.y),
          endPoint: geo.vec2(endPoint.x, endPoint.y),
        });
        currentPoint = endPoint;
        // reflection of cubicStartControlPoint as endPoint
        geo.combine2Vec2(cubicStartControlPoint, 2, endPoint, -1, cubicStartControlPoint);
        quadraticControlPoint = endPoint;
        break;

      case "Q":
      case "q":
        quadraticControlPoint = geo.vec2(command.parameters[0], command.parameters[1]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(quadraticControlPoint, quadraticControlPoint, currentPoint);
        }
        command.parameters = command.parameters.slice(2);
      /* FALLTHROUGH */
      case "T":
      case "t":
        endPoint = geo.vec2(command.parameters[0], command.parameters[1]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(endPoint, endPoint, currentPoint);
        }
        result.push({
          type: "QuadraticBezierCurve",
          startingPoint: geo.vec2(currentPoint.x, currentPoint.y),
          controlPoint: geo.vec2(quadraticControlPoint.x, quadraticControlPoint.y),
          endPoint: geo.vec2(endPoint.x, endPoint.y),
        });
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        geo.combine2Vec2(quadraticControlPoint, 2, endPoint, -1, quadraticControlPoint);
        break;

      case "A":
      case "a":
        endPoint = geo.vec2(command.parameters[5], command.parameters[6]);
        if (isLowerCase(command.letter)) {
          geo.addVec2(endPoint, endPoint, currentPoint);
        }
        result.push({
          type: "EllipticalArcCurve",
          startingPoint: geo.vec2(currentPoint.x, currentPoint.y),
          rx: command.parameters[0],
          ry: command.parameters[1],
          angle: command.parameters[2],
          largeArcFlag: <0 | 1>command.parameters[3], // TODO check
          sweepFlag: <0 | 1>command.parameters[4], // TODO check
          endPoint,
        });
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        quadraticControlPoint = endPoint;
        break;

      case "Z":
      case "z":
        result.push({
          type: "Line",
          startingPoint: geo.vec2(currentPoint.x, currentPoint.y),
          endPoint: geo.vec2(initialPoint.x, initialPoint.y),
        });
        currentPoint = initialPoint;
        cubicStartControlPoint = initialPoint;
        quadraticControlPoint = initialPoint;
        break;
    }
  }

  return result;
}

function isLowerCase(letter: String) {
  return letter === letter.toLowerCase();
}

function getAbsoluteLineEndPoint(command: Command, currentPoint: geo.Vec2Value): geo.Vec2Value {
  let point: geo.Vec2Value;
  switch (command.letter) {
    case "L":
    case "l":
      point = geo.vec2(command.parameters[0], command.parameters[1]);
      break;
    case "H":
      point = geo.vec2(command.parameters[0], currentPoint.y);
      break;
    case "h":
      point = geo.vec2(command.parameters[0], 0);
      break;
    case "V":
      point = geo.vec2(currentPoint.x, command.parameters[0]);
      break;
    case "v":
      point = geo.vec2(0, command.parameters[0]);
      break;
  }
  if (isLowerCase(command.letter)) {
    geo.addVec2(point!, point!, currentPoint);
  }
  return point!;
}
