export const joinMatrices = (matrices: number[][][]): number[][] => {
  // joins the matrices horizontally
  return matrices.reduce((acc, matrix) => {
    return acc.map((row, i) => row.concat([0], matrix[i]));
  });
};
