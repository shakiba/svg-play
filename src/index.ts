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
  /** 2d transform matrix */
  transform?: { a: number; b: number; c: number; d: number; e: number; f: number };
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

  const xf = new Matrix();

  // deprecated option
  const meterPerPixel = (options as any)["meterPerPixelRatio"];
  if (typeof meterPerPixel === "number") {
    xf.scale(meterPerPixel, meterPerPixel);
  }

  // deprecated option
  const scaleY = (options as any)["scaleY"];
  if (typeof scaleY === "number") {
    xf.scale(1, scaleY);
  }

  if (options.transform) {
    xf.concat(options.transform);
  }

  transformTree(factory, rootNode, xf);

  return rootNode;
}
