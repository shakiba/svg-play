import { parseTransform } from "../parsers/parseTransform";
import { Matrix } from "../util/Matrix";

export function parseTransforms(value: string, name: string) {
  if (name !== "transform") {
    return value;
  }
  try {
    return parseTransform(value);
  } catch (e: any) {
    console.warn(e.message); // TODO ok?
    return new Matrix();
  }
}
