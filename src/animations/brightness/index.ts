import { Battery } from "../../icons";
import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";

export class BrightnessAnimation extends Animation {
  public name = "brightness";

  public fps = 1;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  public init(info: RenderInformation): Promise<void> | void {
    return;
  }

  public async render(info: RenderInformation): Promise<AnimationFrameData> {
    return {
      brightness: info.brightness * 255,
      span: 1,
      matrix: Battery,
    };
  }
}
