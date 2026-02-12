// Copied from stag.js with some modifications
// Copyright (c) Ali Shakiba
// Licensed under the MIT License

export interface MatrixValue {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface Vec2Value {
  x: number;
  y: number;
}

export class Matrix {
  /** x-scale */
  a = 1;
  b = 0;
  c = 0;
  /** y-scale */
  d = 1;
  /** x-translate */
  e = 0;
  /** y-translate */
  f = 0;

  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.reset(a, b, c, d, e, f);
  }

  clone() {
    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
  }

  reset(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0): this {
    this.a = typeof a === "number" ? a : 1;
    this.b = typeof b === "number" ? b : 0;
    this.c = typeof c === "number" ? c : 0;
    this.d = typeof d === "number" ? d : 1;
    this.e = typeof e === "number" ? e : 0;
    this.f = typeof f === "number" ? f : 0;
    return this;
  }

  copy(a: MatrixValue): this {
    this.a = a.a;
    this.d = a.d;
    this.b = a.b;
    this.c = a.c;
    this.e = a.e;
    this.f = a.f;
    return this;
  }

  identity() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    return this;
  }

  rotate(angle: number) {
    if (!angle) {
      return this;
    }

    const u = angle ? Math.cos(angle) : 1;
    // android bug may give bad 0 values
    const v = angle ? Math.sin(angle) : 0;

    const a = u * this.a - v * this.b;
    const b = u * this.b + v * this.a;
    const c = u * this.c - v * this.d;
    const d = u * this.d + v * this.c;
    const e = u * this.e - v * this.f;
    const f = u * this.f + v * this.e;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;

    return this;
  }

  translate(x: number, y: number) {
    if (!x && !y) {
      return this;
    }
    this.e += x;
    this.f += y;
    return this;
  }

  scale(x: number, y: number) {
    if (!(x - 1) && !(y - 1)) {
      return this;
    }
    this.a *= x;
    this.b *= y;
    this.c *= x;
    this.d *= y;
    this.e *= x;
    this.f *= y;
    return this;
  }

  skew(x: number, y: number) {
    if (!x && !y) {
      return this;
    }

    const a = this.a + this.b * x;
    const b = this.b + this.a * y;
    const c = this.c + this.d * x;
    const d = this.d + this.c * y;
    const e = this.e + this.f * x;
    const f = this.f + this.e * y;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }

  concat(m: MatrixValue) {
    const a = this.a * m.a + this.b * m.c;
    const b = this.b * m.d + this.a * m.b;
    const c = this.c * m.a + this.d * m.c;
    const d = this.d * m.d + this.c * m.b;
    const e = this.e * m.a + m.e + this.f * m.c;
    const f = this.f * m.d + m.f + this.e * m.b;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;

    return this;
  }

  inverse() {
    const inverted = new Matrix();
    const z = this.a * this.d - this.b * this.c;
    inverted.a = this.d / z;
    inverted.b = -this.b / z;
    inverted.c = -this.c / z;
    inverted.d = this.a / z;
    inverted.e = (this.c * this.f - this.e * this.d) / z;
    inverted.f = (this.e * this.b - this.a * this.f) / z;
    return inverted;
  }

  map(input: Vec2Value, output?: Vec2Value) {
    const x = this.a * input.x + this.c * input.y + this.e;
    const y = this.b * input.x + this.d * input.y + this.f;
    if (output) {
      output.x = x;
      output.y = y;
      return output;
    }
    return { x, y };
  }

  mapX(x: number | Vec2Value, y?: number) {
    if (typeof x === "object") {
      y = x.y;
      x = x.x;
    }
    return this.a * x + this.c * (y as number) + this.e;
  }

  mapY(x: number | Vec2Value, y?: number) {
    if (typeof x === "object") {
      y = x.y;
      x = x.x;
    }
    return this.b * x + this.d * (y as number) + this.f;
  }
}
