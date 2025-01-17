export const rotateMatrix = (
  matrix: number[][],
  deg: 0 | 90 | 180 | 270 = 90,
): number[][] => {
  if (deg === 0) return matrix;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const rotated: number[][] = Array.from(
    { length: deg === 180 ? rows : cols },
    () => Array(rows).fill(0),
  );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      switch (deg) {
        case 90:
          rotated[col][rows - row - 1] = matrix[row][col];
          break;
        case 180:
          rotated[rows - row - 1][cols - col - 1] = matrix[row][col];
          break;
        case 270:
          rotated[cols - col - 1][row] = matrix[row][col];
          break;
      }
    }
  }

  return rotated;
};
