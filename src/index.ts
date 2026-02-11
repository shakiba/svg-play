import * as geo from "./util/Geo";
import { parseStringPromise, processors, OptionsV2 } from "xml2js";
import { wringOutMat33 } from "./mat33/wringOutMat33";
import { Factory, transformTree } from "./converters/factory";
import { parseTransforms } from "./processors/parseTransforms";
import { squashTransforms } from "./processors/squashTransforms";
import { parsePoints } from "./processors/parsePoints";
import { parsePaths } from "./processors/parsePaths";
import { interpretPaths } from "./processors/interpretPaths";

export { type Factory } from "./converters/factory";

export type Options = {
  meterPerPixelRatio?: number;
  scaleY?: number;
  transform?: { p: { x: number; y: number }; q: { c: number; s: number } };
} & Omit<
  Omit<Omit<Omit<OptionsV2, "attrkey">, "explicitChildren">, "preserveChildrenOrder">,
  "explicitRoot"
>;

export async function svgFactory(svg: string, factory: Factory, options: Options = {}) {
  let rootNode = await parseStringPromise(svg, {
    ...options,
    attrkey: "$",
    explicitChildren: true,
    preserveChildrenOrder: true,
    explicitRoot: false,
    attrValueProcessors: [
      parseTransforms,
      <any>squashTransforms,
      parsePoints,
      parsePaths,
      interpretPaths,
      processors.parseNumbers,
      ...(options.attrNameProcessors ?? []),
    ],
  });

  const scale = options.meterPerPixelRatio ?? 1;
  const scaleY = options.scaleY ?? 1;
  const A =
    scale !== 1 || scaleY !== 1
      ? { ex: geo.vec3(scale, 0, 0), ey: geo.vec3(0, scale * scaleY, 0), ez: geo.vec3(0, 0, 1) }
      : null;

  wringOutMat33(rootNode, A);

  transformTree(factory, rootNode, options.transform);

  return rootNode;
}
