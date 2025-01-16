import { Animation, type AnimationFrameData } from "../../lib/animation";
import { numberToBinary } from "../../lib/number-to-binary";

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
    const binary = Array.from({
      ...numberToBinary(frame).reverse(),
      length: 9,
    })
      .map((bit) => bit || 0)
      .reverse();

    return {
      brightness: 50,
      span: 1,
      matrix: [binary],
    };
  }
}
