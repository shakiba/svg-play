import { getAngle } from "../src/util";
import { mat33ToTransform } from "../src/mat33";
import { parseNumberList, parseTransform, parsePath } from "../src/parsers";
import { parsePoints, parseTransforms, squashTransforms } from "../src/processors";
import { convertCircle, convertRect } from "../src/converters";
import { Factory } from "../src/converters/factory";
import * as geo from "../src/util/Geo";

import * as chai from "chai";
import chaiAlmost from "chai-almost";
import { describe, it } from "vitest";

chai.use(chaiAlmost(1e-4));

describe("util", () => {
  describe("mat33ToTransform", () => {
    it("should convert valid transforms", () => {
      const A = {
        ex: geo.vec3(-0.64279, -0.76604, 0),
        ey: geo.vec3(0.76604, -0.64279, 0),
        ez: geo.vec3(40, 20, 0),
      };
      let result = mat33ToTransform(A);
      chai.expect(result.transform).deep.be.almost(geo.transform(40, 20, (-130 * Math.PI) / 180));
      chai.expect(result.overhang).to.be.null;
    });
  });
  describe("getAngle", () => {
    it("should map whole circle", () => {
      const angles = Array(36)
        .fill(0)
        .map((_, i) => 10 * i)
        .map((deg) => (deg * Math.PI) / 180);
      const result = angles.map((angle) =>
        getAngle(Math.acos(Math.cos(angle)), Math.asin(Math.sin(angle))),
      );
      chai.expect(result).deep.be.almost(angles);
    });
  });
});

describe("parsers", () => {
  describe("parseNumberList", () => {
    it("should split at '-' sign", () => {
      chai.expect(parseNumberList("36-7")).deep.be.equal([36, -7]);
    });
    it("should parse x.y.z syntax", () => {
      chai
        .expect(parseNumberList("-1.7 0-10.6.4-10.5 8.3 0"))
        .deep.be.equal([-1.7, 0, -10.6, 0.4, -10.5, 8.3, 0]);
    });
  });

  describe("parseTransform", () => {
    it("should parse translations", () => {
      chai
        .expect(mat33ToTransform(parseTransform("translate(35 74)")[0]).transform)
        .deep.be.equal(geo.transform(35, 74, 0));
    });
    it("second argument of translate should be optional", () => {
      chai
        .expect(mat33ToTransform(parseTransform("translate(22.5)")[0]).transform)
        .deep.be.equal(geo.transform(22.5, 0, 0));
    });
    it("should parse rotations", () => {
      chai
        .expect(mat33ToTransform(parseTransform("rotate(-130)")[0]).transform)
        .deep.be.almost(geo.transform(0, 0, (-130 * Math.PI) / 180));
    });
    it("should parse rotations with offset", () => {
      chai
        .expect(mat33ToTransform(parseTransform("rotate(30, 100, 50)")[0]).transform)
        .deep.be.almost(geo.transform(38.3974, -43.3012, Math.PI / 6));
    });
    it("should parse matrices", () => {
      chai
        .expect(
          mat33ToTransform(parseTransform("matrix(-0.64279 -0.76604 0.76604 -0.64279 40 20)")[0])
            .transform,
        )
        .deep.be.almost(geo.transform(40, 20, (-130 * Math.PI) / 180));
    });
  });

  describe("parsePaths", () => {
    it("should parse basic paths", () => {
      chai.expect(parsePath("M 20,-35 Q 64 73.6 -6 4 z")).deep.be.equal([
        { letter: "M", parameters: [20, -35] },
        { letter: "Q", parameters: [64, 73.6, -6, 4] },
        { letter: "z", parameters: [] },
      ]);
    });
    it("should expand implict commands", () => {
      chai
        .expect(parsePath("M 1 1 2 4 3 9 4 16 q 1 2 3 4 10 20 30 40 100 200 300 400"))
        .deep.be.equal([
          { letter: "M", parameters: [1, 1] },
          { letter: "L", parameters: [2, 4] },
          { letter: "L", parameters: [3, 9] },
          { letter: "L", parameters: [4, 16] },
          { letter: "q", parameters: [1, 2, 3, 4] },
          { letter: "q", parameters: [10, 20, 30, 40] },
          { letter: "q", parameters: [100, 200, 300, 400] },
        ]);
    });
    it("should keep path until error", () => {
      chai.expect(parsePath("M 20,50 A 10 10 0 0 1 20 40 Q 1 2 3 4 5 L 34 64 Z")).deep.be.equal([
        { letter: "M", parameters: [20, 50] },
        { letter: "A", parameters: [10, 10, 0, 0, 1, 20, 40] },
        { letter: "Q", parameters: [1, 2, 3, 4] },
      ]);
    });
    it("should treat command without parameters as error", () => {
      chai
        .expect(parsePath("M 20,50 Q A 10 10 0 0 1 20 40"))
        .deep.be.equal([{ letter: "M", parameters: [20, 50] }]);
    });
    it("should still arse after Z appears", () => {
      chai.expect(parsePath("M 10,50 t 30,0 Z Q -25,-25 40,50 z")).deep.be.equal([
        { letter: "M", parameters: [10, 50] },
        { letter: "t", parameters: [30, 0] },
        { letter: "Z", parameters: [] },
        { letter: "Q", parameters: [-25, -25, 40, 50] },
        { letter: "z", parameters: [] },
      ]);
    });
  });
});

describe("processors", () => {
  describe("parsePoints", () => {
    it("should ignore unpaired values", () => {
      chai.expect(parsePoints("35,64 3.7,477,23", "points")).have.lengthOf(2);
    });
  });
  describe("squashTransforms", () => {
    it("should multiply transforms in right order", () => {
      let a = squashTransforms(
        parseTransforms("translate(100, 100)rotate(-130)", "transform") as geo.Mat33Value[],
        "transform",
      );
      let b = squashTransforms(
        parseTransforms(
          "matrix(-0.64279 -0.76604 0.76604 -0.64279 100 100)",
          "transform",
        ) as geo.Mat33Value[],
        "transform",
      );
      chai.expect(a).deep.be.almost(b);
    });
  });
});

describe("converters", () => {
  describe("parseCircle", () => {
    it("should apply transformations in right order", () => {
      const factory = new TestFactory();
      convertCircle(
        factory,
        {
          $: {
            cx: 50,
            cy: 70,
            r: 50,
            transform: geo.transform(38.3974, -43.3012, Math.PI / 6),
          },
        },
        geo.transform(40, 20, (-130 * Math.PI) / 180),
      );
      chai.expect(factory.parts).deep.be.almost([
        {
          type: "circle",
          center: geo.vec2(42.402117222946615, -42.97640014295341),
          radius: 50,
        },
      ]);
    });
  });
  describe("parseRect", () => {
    it("should apply correct rotation", () => {
      const factory = new TestFactory();
      convertRect(
        factory,
        {
          $: {
            x: 10,
            y: -20,
            width: 50,
            height: 40,
            transform: geo.transform(38.3974, -43.3012, Math.PI / 6),
          },
        },
        geo.transform(40, 20, (-130 * Math.PI) / 180),
      );
      chai.expect(factory.parts).deep.be.almost([
        {
          type: "box",
          width: 50,
          height: 40,
          center: geo.vec2(-23.929702822903984, -16.04891141108515),
          angle: (260 * Math.PI) / 180,
        },
      ]);
    });
  });
  // TODO
});

class TestFactory implements Factory {
  parts: any[] = [];
  polygon = (node: any, vertices: geo.Vec2Value[]) => {
    const part = {
      type: "polygon",
      vertices,
    };
    this.parts.push(part);
    return part;
  };
  circle = (node: any, p: geo.Vec2Value, radius: number) => {
    const part = {
      type: "circle",
      center: p,
      radius,
    };
    this.parts.push(part);
    return part;
  };
  chain = (node: any, points: geo.Vec2Value[]) => {
    const part = {
      type: "chain",
      vertices: points,
    };
    this.parts.push(part);
    return part;
  };
  edge = (node: any, p1: geo.Vec2Value, p2: geo.Vec2Value) => {
    const part = {
      type: "edge",
      v1: p1,
      v2: p2,
    };
    this.parts.push(part);
    return part;
  };
  box = (node: any, width: number, height: number, center: geo.Vec2Value, angle: number) => {
    const part = {
      type: "box",
      width,
      height,
      center,
      angle,
    };
    this.parts.push(part);
    return part;
  };
}
