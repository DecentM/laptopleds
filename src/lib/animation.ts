import { animate } from "./animate";
import type { Display } from "./display";

export type AnimationFrameData = {
  brightness: number;
  span: number;
  matrix: number[][];
};

export type AnimationData = {
  name: string;
  fps: number;
  interruptible: boolean;
  frameskip: boolean;
  frames: AnimationFrameData[];
};

export abstract class Animation {
  public abstract readonly name: string;

  public abstract readonly fps: number;

  public abstract readonly interruptible: boolean;

  public abstract readonly frameskip: boolean;

  public abstract render(
    frame: number,
  ): Promise<AnimationFrameData> | AnimationFrameData;

  public playCriteria(frame: number): Promise<boolean> | boolean {
    return false;
  }

  public play = async (display: Display) => {
    let frameCount = 0;
    let spanProgress = 0;

    if (this.fps < 0 || this.fps > 1000) {
      throw new Error(`Invalid animation frame rate - 0 < ${this.fps} < 1000`);
    }

    await animate(this.fps, this.frameskip, async (skip) => {
      const frame = await this.render(frameCount);

      await Promise.all([
        display.draw(
          [
            {
              matrix: frame.matrix,
              pos: [0, 0],
            },
          ],
          false,
        ),
        display.setBrightness(frame.brightness, false),
      ]);
      await display.drain();

      if (frame.span > spanProgress + 1) {
        spanProgress++;
      } else {
        frameCount++;
        spanProgress = 0;
      }

      if (skip) frameCount += skip;

      return await this.playCriteria(frameCount);
    });
  };
}

export abstract class JsonAnimation extends Animation {
  constructor(private readonly data: AnimationData) {
    super();

    this.name = data.name;
    this.fps = data.fps;
    this.interruptible = data.interruptible;
    this.frameskip = data.frameskip;
  }

  public readonly name;

  public readonly fps;

  public readonly interruptible;

  public readonly frameskip;

  public render(frame: number) {
    return this.data.frames[frame % this.data.frames.length];
  }

  public playCriteria(frame: number) {
    return frame < this.data.frames.length;
  }
}
