import { Battery } from "../../icons";
import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";

import { BrightnessDataSource } from "../../data-sources/dbus/brightness";
import { BrightnessMaxDataSource } from "../../data-sources/dbus/brightness-max";
import { rotateMatrix } from "../../lib/rotate-matrix";

export class BrightnessAnimation extends Animation {
  public name = "brightness";

  public fps = 1;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  private brightness = new BrightnessDataSource();

  private brightnessMax = new BrightnessMaxDataSource();

  public async render(info: RenderInformation): Promise<AnimationFrameData> {
    const brightnessPct =
      (await this.brightness.read()) / (await this.brightnessMax.read());

    return {
      brightness: brightnessPct * 255,
      span: 1,
      matrix: Battery,
    };
  }
}
