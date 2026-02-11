import * as geo from "../util/Geo";

export function mat33mul(A: geo.Mat33Value, B: geo.Mat33Value): geo.Mat33Value {
  const {
    ex: { x: a, y: b },
    ey: { x: c, y: d },
    ez: { x: e, y: f },
  } = A;

  const {
    ex: { x: a_, y: b_ },
    ey: { x: c_, y: d_ },
    ez: { x: e_, y: f_ },
  } = B;

  return {
    ex: geo.vec3(a * a_ + c * b_, b * a_ + d * b_, 0),
    ey: geo.vec3(a * c_ + c * d_, b * c_ + d * d_, 0),
    ez: geo.vec3(a * e_ + c * f_ + e, b * e_ + d * f_ + f, 1),
  };
}
