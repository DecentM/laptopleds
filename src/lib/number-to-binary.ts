export const numberToBinary = (input: number): number[] => {
  if (input < 0) {
    throw new Error("Only non-negative numbers are supported.");
  }
  return input
    .toString(2)
    .split("")
    .map((digit) => Number.parseInt(digit, 10));
};
