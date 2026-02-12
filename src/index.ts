import { parseStringPromise, processors, OptionsV2 } from "xml2js";
import { Factory, transformTree } from "./converters/factory";
import { parseTransforms } from "./processors/parseTransforms";
import { squashTransforms } from "./processors/squashTransforms";
import { parsePoints } from "./processors/parsePoints";
import { parsePaths } from "./processors/parsePaths";
import { interpretPaths } from "./processors/interpretPaths";
import { Matrix } from "./util/Matrix";

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

  const xf = new Matrix()
  if (typeof options.meterPerPixelRatio === "number" || options.meterPerPixelRatio !== 1) {
    const scale = options.meterPerPixelRatio as number;
    xf.scale(scale, scale);
  }

  if (typeof options.scaleY === "number" || options.scaleY !== 1) {
    const scaleY = options.scaleY as number;
    xf.scale(1, scaleY);
  }

  transformTree(factory, rootNode, xf);

  return rootNode;
}
