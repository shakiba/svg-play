import { parseTransform } from "../parsers/parseTransform";
import * as geo from "../util/Geo";

export function parseTransforms(value: string, name: string) {
  if (name !== "transform") {
    return value;
  }
  try {
    return parseTransform(value);
  } catch (e: any) {
    console.warn(e.message); // TODO ok?
    return geo.transform(0, 0, 0);
  }
}
