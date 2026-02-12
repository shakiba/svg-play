import { Matrix } from "../util/Matrix";

export function squashTransforms(value: Matrix[], name: string) {
  if (name !== "transform") {
    return value;
  }
  return value.reverse().reduce((result, mat) => result.concat(mat), new Matrix());
}
