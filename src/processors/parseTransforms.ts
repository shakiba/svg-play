import * as geo from "../common/Geo";
import { parseTransform } from "../parsers";

export default function parseTransforms(value: string, name: string) {
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
