import { LowercaseLetters, Symbols, UppercaseLetters } from "../icons";
import { joinMatrices } from "./join-matrix";

const specialMap: Record<string, number[][]> = {
  "%": Symbols.Pct,
  "!": Symbols.Exclamation,
  "?": Symbols.Question,
  " ": Symbols.Space,
  _: Symbols.Underscore,
  ",": Symbols.Comma,
  ".": Symbols.Period,
  ":": Symbols.Colon,
  ";": Symbols.Semicolon,
  "'": Symbols.Apostrophe,
  '"': Symbols.Quote,
  "-": Symbols.Dash,
  "+": Symbols.Plus,
  "=": Symbols.Equals,
  "/": Symbols.Slash,
  "\\": Symbols.Backslash,
  "(": Symbols.LeftParen,
  ")": Symbols.RightParen,
  "{": Symbols.LeftCurly,
  "}": Symbols.RightCurly,
  "~": Symbols.Tilde,
};

export const textToMatrix = (text: string): number[][] => {
  const textMatrix: number[][][] = [];

  for (const char of text) {
    if (char in specialMap) {
      textMatrix.push(specialMap[char]);
    } else if (char in LowercaseLetters) {
      textMatrix.push(LowercaseLetters[char as keyof typeof LowercaseLetters]);
    } else if (char in UppercaseLetters) {
      textMatrix.push(UppercaseLetters[char as keyof typeof UppercaseLetters]);
    } else {
      textMatrix.push(Symbols.Question);
    }
  }

  return joinMatrices(textMatrix);
};
