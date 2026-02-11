import { mat33mul } from "../mat33/mat33mul";
import * as geo from "../util/Geo";

export function squashTransforms(value: geo.Mat33Value[], name: string) {
  if (name !== "transform") {
    return value;
  }
  return value.reduce(mat33mul);
}
