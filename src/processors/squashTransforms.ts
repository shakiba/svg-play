import * as geo from "../common/Geo";
import mat33mul from "../mat33/mat33mul";

export default function squashTransforms(value: geo.Mat33Value[], name: string) {
  if (name !== "transform") {
    return value;
  }
  return value.reduce(mat33mul);
}
