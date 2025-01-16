export const invertMatrix = (matrix: number[][]): number[][] => {
  return matrix.map((row) => row.map((cell) => (cell === 0 ? 1 : 0)));
};
