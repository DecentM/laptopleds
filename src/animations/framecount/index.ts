import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import { textToMatrix } from "../../lib/text-to-matrix";

export class FramecountAnimation extends Animation {
  public name = "framecount";

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

    const matrix = textToMatrix(`${this.frameNumber}`);

    return {
      brightness: 50,
      span: 1,
      matrix,
    };
  }
}
