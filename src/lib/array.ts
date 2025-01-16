export const createArray = <T>(length: number, ...args: number[]): T[][] => {
  const arr = new Array(length || 0);
  let i = length;

  if (args.length > 0) {
    while (i--) arr[length - 1 - i] = createArray(args[0], ...args.slice(1));
  }

  return arr;
};
