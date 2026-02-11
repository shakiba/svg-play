import { parsePath } from "../parsers/parsePath";

export function parsePaths(value: string, name: string) {
  if (name !== "d") {
    return value;
  }
  try {
    return parsePath(value);
  } catch (e: any) {
    console.warn(e.message); // TODO ok?
    return [];
  }
}
