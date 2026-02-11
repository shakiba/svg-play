import * as geo from "../util/Geo";
import { getAngle } from "../util/getAngle";
import { mat33mul } from "./mat33mul";

const EPSILON = 1e-3;

/**
 * Returns a Transform T and an overhang B such that A = T * B
 */
export function mat33ToTransform(A: geo.Mat33Value): {
  transform: geo.TransformValue;
  overhang: geo.Mat33Value | null;
} {
  const {
    ex: { x: a, y: b },
    ey: { x: c, y: d },
    ez: { x: e, y: f },
  } = A;

  const det = a * d - b * c;
  if (Math.abs(det) === 0) {
    throw new Error("Invalid transforma because the matrix does not have full rank");
  }

  // naively take first column to calcutate rotation angle
  const length = Math.hypot(a, b);
  const alpha = getAngle(Math.acos(a / length), Math.asin(b / length));

  const transform = geo.transform(e, f, alpha);

  // B = T^{-1} * A
  const B = mat33mul(
    {
      ex: geo.vec3(Math.cos(alpha), -Math.sin(alpha), 0),
      ey: geo.vec3(Math.sin(alpha), Math.cos(alpha), 0),
      ez: geo.vec3(
        -f * Math.sin(alpha) - e * Math.cos(alpha),
        -f * Math.cos(alpha) + e * Math.sin(alpha),
        1,
      ),
    },
    A,
  );

  return {
    transform,
    overhang: isAlmostIdentity(B) ? null : B,
  };
}

function isAlmostIdentity(A: geo.Mat33Value): boolean {
  const {
    ex: { x: a, y: b },
    ey: { x: c, y: d },
    ez: { x: e, y: f },
  } = A;

  return [a - 1, b, c, d - 1, e, f].every((x) => Math.abs(x) < EPSILON);
}
