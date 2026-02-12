export function parseNumberList(value: string): number[] {
  // TODO validation (we currently accept invalid number lists)
  // make sure it supports exponent, e.g. "1e-3"
  let result = value
    .split(/\s+|,/)
    .map(parseFloat)
    .filter((x) => !isNaN(x) && isFinite(x));
  if (result === undefined) {
    return [];
  }
  return result;
}
