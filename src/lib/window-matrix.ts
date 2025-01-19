export const windowMatrix = (
  matrix: number[][],
  window: [number, number, number, number],
): number[][] => {
  const [startRow, startCol, numRows, numCols] = window;

  return Array.from({ length: numRows }, (_, rowIndex) => {
    const row = matrix[startRow + rowIndex] || [];
    // Handle negative startCol by adding empty spaces (e.g., 0s) on the left
    const paddedRow = Array(Math.max(0, -startCol)).fill(0).concat(row);
    // Extract the window and pad on the right if needed
    const slicedRow = paddedRow.slice(
      Math.max(0, startCol),
      startCol + numCols,
    );
    return slicedRow.concat(
      Array(Math.max(0, numCols - slicedRow.length)).fill(0),
    );
  });
};
