export const composite = (
  base: number[][],
  layer: number[][],
  anchor: [number, number],
): number[][] => {
  const result = base.map((row) => [...row]);

  const [anchorRow, anchorCol] = anchor;

  for (let i = 0; i < layer.length; i++) {
    for (let j = 0; j < layer[i].length; j++) {
      const baseRow = anchorRow + i;
      const baseCol = anchorCol + j;

      // Check if the position is within the bounds of the base matrix
      if (
        baseRow >= 0 &&
        baseRow < result.length &&
        baseCol >= 0 &&
        baseCol < result[0].length
      ) {
        // Only overlay non-zero values
        if (layer[i][j] === 1) {
          result[baseRow][baseCol] = layer[i][j];
        }
      }
    }
  }

  return result;
};
