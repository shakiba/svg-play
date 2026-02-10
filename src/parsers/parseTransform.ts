import * as geo from "../common/Geo";
import parseNumberList from "./parseNumberList";

export default function parseTransform(value: string): geo.Mat33Value[] {
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

  function parseMatrixTransform(params: number[]): geo.Mat33Value {
    if (params.length !== 6) {
      throw new Error(errorMsg);
    }
    const [a, b, c, d, e, f] = [...params];

    return { ex: geo.vec3(a, b, 0), ey: geo.vec3(c, d, 0), ez: geo.vec3(e, f, 1) };
  }

  function parseTranslationTransform(params: number[]): geo.Mat33Value {
    if (params.length !== 1 && params.length !== 2) {
      throw new Error(errorMsg);
    }
    return {
      ex: geo.vec3(1, 0, 0),
      ey: geo.vec3(0, 1, 0),
      ez: geo.vec3(params[0], params[1] ?? 0, 1),
    };
  }

  function parseRotationTransform(params: number[]): geo.Mat33Value {
    if (params.length !== 1 && params.length !== 3) {
      throw new Error(errorMsg);
    }
    const [rotationInDegrees, x, y] = [...params];
    const alpha = (rotationInDegrees * Math.PI) / 180;

    return {
      ex: geo.vec3(Math.cos(alpha), Math.sin(alpha), 0),
      ey: geo.vec3(-Math.sin(alpha), Math.cos(alpha), 0),
      ez:
        x === undefined
          ? geo.vec3(0, 0, 1)
          : geo.vec3(
              -x * Math.cos(alpha) + y * Math.sin(alpha) + x,
              -x * Math.sin(alpha) - y * Math.cos(alpha) + y,
              1,
            ),
    };
  }

  function parseScale(params: number[]): geo.Mat33Value {
    if (params.length !== 1 && params.length !== 2) {
      throw new Error(errorMsg);
    }
    return {
      ex: geo.vec3(params[0], 0, 0),
      ey: geo.vec3(0, params[1] ?? params[0], 0),
      ez: geo.vec3(0, 0, 1),
    };
  }

  function parseSkewX(params: number[]): geo.Mat33Value {
    if (params.length !== 1) {
      throw new Error(errorMsg);
    }
    const alpha = (params[0] * Math.PI) / 180;

    return {
      ex: geo.vec3(1, 0, 0),
      ey: geo.vec3(Math.tan(alpha), 1, 0),
      ez: geo.vec3(0, 0, 1),
    };
  }

  function parseSkewY(params: number[]): geo.Mat33Value {
    if (params.length !== 1) {
      throw new Error(errorMsg);
    }
    const alpha = (params[0] * Math.PI) / 180;

    return {
      ex: geo.vec3(1, Math.tan(alpha), 0),
      ey: geo.vec3(0, 1, 0),
      ez: geo.vec3(0, 0, 1),
    };
  }
}
