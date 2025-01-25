import { BlankScreen } from "../../icons";
import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import { composite } from "../../lib/composite";
import { rotateMatrix } from "../../lib/rotate-matrix";
import { textToMatrix } from "../../lib/text-to-matrix";

export class FramecountAnimation extends Animation {
  public static name = "framecount";

  public fps = 3;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  public init(info: RenderInformation): Promise<void> | void {
    this.frameNumber = 0;
  }

  private frameNumber = 0;

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    this.frameNumber++;

    const matrix = composite(
      BlankScreen,
      rotateMatrix(textToMatrix(`${this.frameNumber}`), 90),
      [0, 0],
    );

    return {
      brightness: 50,
      span: 1,
      matrix,
    };
  }
}
