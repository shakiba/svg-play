import { parseNumberList } from "../parsers/parseNumberList";
import { Vec2Value } from "../util/Matrix";

export function parsePoints(value: string, name: string) {
  if (name !== "points") {
    return value;
  }
  const coordinates = parseNumberList(value);
  const points = [] as Vec2Value[];

  for (let i = 1; i < coordinates.length; i += 2) {
    points.push({ x: coordinates[i - 1], y: coordinates[i] });
  }

  return points;
}
