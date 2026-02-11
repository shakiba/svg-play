import { interpretPath } from "../parsers/interpretPath";

export function interpretPaths(value: any, name: string) {
  if (name !== "d") {
    return value;
  }
  try {
    return interpretPath(value);
  } catch (e: any) {
    console.warn(e.message); // TODO ok?
    return [];
  }
}
