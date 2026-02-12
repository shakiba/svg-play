import { Vec2Value } from "../util/Matrix";
import { Command } from "./parsePath";

export type LineSegment = {
  type: "Line";
  startingPoint: Vec2Value;
  endPoint: Vec2Value;
};
export type CubicBezierCurveSegment = {
  type: "CubicBezierCurve";
  startingPoint: Vec2Value;
  endPoint: Vec2Value;
  startControlPoint: Vec2Value;
  endControlPoint: Vec2Value;
};
export type QuadraticBezierCurveSegment = {
  type: "QuadraticBezierCurve";
  startingPoint: Vec2Value;
  endPoint: Vec2Value;
  controlPoint: Vec2Value;
};
export type EllipticalArcCurveSegment = {
  type: "EllipticalArcCurve";
  startingPoint: Vec2Value;
  rx: number;
  ry: number;
  angle: number;
  largeArcFlag: 0 | 1;
  sweepFlag: 0 | 1;
  endPoint: Vec2Value;
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

  let currentPoint = { x: start.parameters[0], y: start.parameters[1] };
  let cubicStartControlPoint = currentPoint;
  let quadraticControlPoint = currentPoint;
  let initialPoint = currentPoint;

  for (let command of commands) {
    let endPoint: Vec2Value;
    let endControlPoint: Vec2Value;
    switch (command.letter) {
      case "M":
      case "m":
        endPoint = { x: command.parameters[0], y: command.parameters[1] };
        if (isLowerCase(command.letter)) {
          endPoint.x += currentPoint.x;
          endPoint.y += currentPoint.y;
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
          startingPoint: { x: currentPoint.x, y: currentPoint.y },
          endPoint: { x: endPoint.x, y: endPoint.y },
        });
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        quadraticControlPoint = endPoint;
        break;

      case "C":
      case "c":
        cubicStartControlPoint = { x: command.parameters[0], y: command.parameters[1] };
        if (isLowerCase(command.letter)) {
          cubicStartControlPoint.x += currentPoint.x;
          cubicStartControlPoint.y += currentPoint.y;
        }
        command.parameters = command.parameters.slice(2);
      /* FALLTHROUGH */
      case "S":
      case "s":
        endControlPoint = { x: command.parameters[0], y: command.parameters[1] };
        endPoint = { x: command.parameters[2], y: command.parameters[3] };
        if (isLowerCase(command.letter)) {
          endControlPoint.x += currentPoint.x;
          endControlPoint.y += currentPoint.y;
          endPoint.x += currentPoint.x;
          endPoint.y += currentPoint.y;
        }
        result.push({
          type: "CubicBezierCurve",
          startingPoint: { x: currentPoint.x, y: currentPoint.y },
          startControlPoint: { x: cubicStartControlPoint.x, y: cubicStartControlPoint.y },
          endControlPoint: { x: endControlPoint.x, y: endControlPoint.y },
          endPoint: { x: endPoint.x, y: endPoint.y },
        });
        currentPoint = endPoint;
        // reflection of cubicStartControlPoint as endPoint
        cubicStartControlPoint = {
          x: 2 * endPoint.x - cubicStartControlPoint.x,
          y: 2 * endPoint.y - cubicStartControlPoint.y,
        };
        quadraticControlPoint = endPoint;
        break;

      case "Q":
      case "q":
        quadraticControlPoint = { x: command.parameters[0], y: command.parameters[1] };
        if (isLowerCase(command.letter)) {
          quadraticControlPoint.x += currentPoint.x;
          quadraticControlPoint.y += currentPoint.y;
        }
        command.parameters = command.parameters.slice(2);
      /* FALLTHROUGH */
      case "T":
      case "t":
        endPoint = { x: command.parameters[0], y: command.parameters[1] };
        if (isLowerCase(command.letter)) {
          endPoint.x += currentPoint.x;
          endPoint.y += currentPoint.y;
        }
        result.push({
          type: "QuadraticBezierCurve",
          startingPoint: { x: currentPoint.x, y: currentPoint.y },
          controlPoint: { x: quadraticControlPoint.x, y: quadraticControlPoint.y },
          endPoint: { x: endPoint.x, y: endPoint.y },
        });
        currentPoint = endPoint;
        cubicStartControlPoint = endPoint;
        quadraticControlPoint = {
          x: 2 * endPoint.x - quadraticControlPoint.x,
          y: 2 * endPoint.y - quadraticControlPoint.y,
        };
        break;

      case "A":
      case "a":
        endPoint = { x: command.parameters[5], y: command.parameters[6] };
        if (isLowerCase(command.letter)) {
          endPoint.x += currentPoint.x;
          endPoint.y += currentPoint.y;
        }
        result.push({
          type: "EllipticalArcCurve",
          startingPoint: { x: currentPoint.x, y: currentPoint.y },
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
          startingPoint: { x: currentPoint.x, y: currentPoint.y },
          endPoint: { x: initialPoint.x, y: initialPoint.y },
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

function getAbsoluteLineEndPoint(command: Command, currentPoint: Vec2Value): Vec2Value {
  let point: Vec2Value = { x: 0, y: 0 };
  switch (command.letter) {
    case "L":
    case "l":
      point = { x: command.parameters[0], y: command.parameters[1] };
      break;
    case "H":
      point = { x: command.parameters[0], y: currentPoint.y };
      break;
    case "h":
      point = { x: command.parameters[0], y: 0 };
      break;
    case "V":
      point = { x: currentPoint.x, y: command.parameters[0] };
      break;
    case "v":
      point = { x: 0, y: command.parameters[0] };
      break;
  }
  if (isLowerCase(command.letter)) {
    point.x += currentPoint.x;
    point.y += currentPoint.y;
  }
  return point;
}
