import * as geo from "../util/Geo";
import { isShape } from "../util/isShape";
import { applyMat33ToShape } from "./applyMat33ToShape";
import { mat33mul } from "./mat33mul";
import { mat33ToTransform } from "./mat33ToTransform";

export function wringOutMat33(node: any, overhang: geo.Mat33Value | null) {
  if (isShape(node)) {
    applyMat33ToShape(node, overhang);
  } else if (node.$$) {
    if (node.$?.transform) {
      let transform = <geo.Mat33Value>node.$.transform;
      if (overhang) {
        transform = mat33mul(overhang, transform);
      }
      const res = mat33ToTransform(transform);
      node.$.transform = res.transform;
      overhang = res.overhang;
    }

    for (let child of node.$$) {
      wringOutMat33(child, overhang);
    }
  }
}
