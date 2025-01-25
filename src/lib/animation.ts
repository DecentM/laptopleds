import anime, { type AnimeInstance, type AnimeParams } from "animejs";
import { animate } from "./animate";
import type { Display } from "./display";

import { BrightnessDataSource } from "../data-sources/brightness";
import { BatteryDataSource } from "../data-sources/battery";

export type AnimationFrameData = {
  brightness: number;
  matrix: number[][];
};

export type AnimationData = {
  name: string;
  fps: number;
  interruptible: boolean;
  frameskip: boolean;
  frames: AnimationFrameData[];
};

export type RenderInformation = {
  timestamp: number;
  brightness: number;
  battery: number;
};

export abstract class Animation {
  public static readonly name: string;

  public abstract readonly fps: number;

  public abstract readonly interruptible: boolean;

  public abstract readonly frameskip: boolean;

  public abstract render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return false;
  }

  public abstract init(info: RenderInformation): Promise<void> | void;

  private brightness = new BrightnessDataSource();

  private battery = new BatteryDataSource();

  private async getInfo() {
    return {
      timestamp: performance.now(),
      brightness: await this.brightness.read(),
      battery: await this.battery.read(),
    };
  }

  public play = async (display: Display) => {
    let frameNumber = 0;

    if (this.fps < 0 || this.fps > 1000) {
      throw new Error(`Invalid animation frame rate - 0 < ${this.fps} < 1000`);
    }

    let info = await this.getInfo();
    await this.init(info);

    await animate(this.fps, this.frameskip, async (skip) => {
      info = await this.getInfo();
      const frame = await this.render(info);

      await Promise.all([
        display.draw(frame.matrix, false),
        display.setBrightness(frame.brightness, false),
      ]);
      await display.drain();

      frameNumber++;

      if (skip) frameNumber += skip;

      return await this.playCriteria(info);
    });
  };
}
