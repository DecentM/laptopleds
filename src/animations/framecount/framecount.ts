import {
  LowercaseLetters,
  Numbers,
  Symbols,
  UppercaseLetters,
} from "../../icons";
import { Animation, type AnimationFrameData } from "../../lib/animation";
import { joinMatrices } from "../../lib/join-matrix";
import { numberToBinary } from "../../lib/number-to-binary";
import { rotateMatrix } from "../../lib/rotate-matrix";
import { textToMatrix } from "../../lib/text-to-matrix";

export class FramecountAnimation extends Animation {
  public name = "framecount";

  public fps = 1;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(frame: number): Promise<boolean> | boolean {
    return true;
  }

  public render(
    frame: number,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    const frames = [
      // ...Object.values(Numbers),
      // ...Object.values(LowercaseLetters),
      // ...Object.values(UppercaseLetters),
      ...Object.values(Symbols),
    ];

    return {
      brightness: 50,
      span: 1,
      matrix: rotateMatrix(textToMatrix("Hello, world!"), 270),
    };
  }
}
