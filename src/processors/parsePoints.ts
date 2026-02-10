import * as geo from "../util/Geo";
import { parseNumberList } from "../parsers";

export default function parsePoints(value: string, name: string) {
  if (name !== "points") {
    return value;
  }
  const coordinates = parseNumberList(value);
  const points = [] as geo.Vec2Value[];

  for (let i = 1; i < coordinates.length; i += 2) {
    points.push(geo.vec2(coordinates[i - 1], coordinates[i]));
  }

  return points;
}
