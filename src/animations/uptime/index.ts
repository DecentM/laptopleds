import * as os from "node:os";

import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import { numberToBinary } from "../../lib/number-to-binary";
import { composite } from "../../lib/composite";
import { BlankScreen } from "../../icons";

export class UptimeAnimation extends Animation {
  public static name = "uptime";

  public fps = 1;

  public frameskip = false;

  public interruptible = true;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  public init(info: RenderInformation): Promise<void> | void {
    return;
  }

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    const uptime = os.uptime();

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const dSeconds = Array.from({
      ...numberToBinary(seconds).reverse(),
      length: 9,
    })
      .map((bit) => bit || 0)
      .reverse();

    const dMinutes = Array.from({
      ...numberToBinary(minutes).reverse(),
      length: 9,
    })
      .map((bit) => bit || 0)
      .reverse();

    const dHours = Array.from({
      ...numberToBinary(hours).reverse(),
      length: 9,
    })
      .map((bit) => bit || 0)
      .reverse();

    return {
      brightness: 50,
      matrix: composite(BlankScreen, [dHours, dMinutes, dSeconds], [0, 0]),
    };
  }
}
