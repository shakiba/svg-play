import { Matrix } from "../util/Matrix";
import { parseNumberList } from "./parseNumberList";

export function parseTransform(value: string): Matrix[] {
  const errorMsg = `Unexpected value '${value}' for transform attribute`;

  // TODO validation (we currently accept invalid transforms)
  let transformDefinitions = value.match(/([a-zA-Z]+\s*\([^\)]+\))/g);
  if (transformDefinitions === null) {
    throw new Error(errorMsg);
  }

  return transformDefinitions
    .map((transformDefinition) => {
      let strings = transformDefinition.match(/([a-zA-Z]+)\s*\(([^\)]+)\)/);
      if (strings === null) {
        throw new Error(errorMsg);
      }
      const [_, name, paramsString] = strings;

      return {
        name,
        params: parseNumberList(paramsString),
      };
    })
    .map(({ name, params }) => {
      switch (name) {
        case "matrix":
          return parseMatrixTransform(params);
        case "translate":
          return parseTranslationTransform(params);
        case "rotate":
          return parseRotationTransform(params);
        case "scale":
          return parseScale(params);
        case "skewX":
          return parseSkewX(params);
        case "skewY":
          return parseSkewY(params);
        default:
          throw new Error(errorMsg);
      }
    });

  function parseMatrixTransform(params: number[]): Matrix {
    if (params.length !== 6) {
      throw new Error(errorMsg);
    }
    const [a, b, c, d, e, f] = [...params];

    return new Matrix(a, b, c, d, e, f);
  }

  function parseTranslationTransform(params: number[]): Matrix {
    if (params.length !== 1 && params.length !== 2) {
      throw new Error(errorMsg);
    }
    return new Matrix(1, 0, 0, 1, params[0], params[1] ?? 0);
  }

  function parseRotationTransform(params: number[]): Matrix {
    if (params.length !== 1 && params.length !== 3) {
      throw new Error(errorMsg);
    }
    const [rotationInDegrees, x, y] = [...params];
    const alpha = (rotationInDegrees * Math.PI) / 180;

    return new Matrix().rotate(alpha);
  }

  function parseScale(params: number[]): Matrix {
    if (params.length !== 1 && params.length !== 2) {
      throw new Error(errorMsg);
    }
    return new Matrix().scale(params[0], params[1] ?? params[0]);
  }

  function parseSkewX(params: number[]): Matrix {
    if (params.length !== 1) {
      throw new Error(errorMsg);
    }
    const alpha = (params[0] * Math.PI) / 180;

    return new Matrix().skew(params[0], 0);
  }

  function parseSkewY(params: number[]): Matrix {
    if (params.length !== 1) {
      throw new Error(errorMsg);
    }
    const alpha = (params[0] * Math.PI) / 180;

    return new Matrix().skew(0, params[0]);
  }
}
