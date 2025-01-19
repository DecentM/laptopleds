import {
  BlankScreen,
  LowercaseLetters,
  Numbers,
  Symbols,
  UppercaseLetters,
} from "../../icons";

import { Animation, type AnimationFrameData } from "../../lib/animation";
import { composite } from "../../lib/composite";
import { joinMatrices } from "../../lib/join-matrix";
import { numberToBinary } from "../../lib/number-to-binary";
import { rotateMatrix } from "../../lib/rotate-matrix";
import { textToMatrix } from "../../lib/text-to-matrix";
import { windowMatrix } from "../../lib/window-matrix";

export class FramecountAnimation extends Animation {
  public name = "framecount";

  public fps = 3;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(frame: number): Promise<boolean> | boolean {
    return true;
  }

  public render(
    frame: number,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    const matrix = textToMatrix(`${frame}`);

    const matrixWidth = matrix[0]?.length || 0;
    const windowWidth = 34;
    const startCol = (frame % (matrixWidth + windowWidth)) - windowWidth;

    return {
      brightness: 50,
      span: 1,
      matrix,
    };
  }
}
