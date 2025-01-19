import anime, { type AnimeInstance, type AnimeParams } from "animejs";
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

export type RenderInformation = {
  frameNumber: number;
  timestamp: number;
};

export abstract class Animation {
  public abstract readonly name: string;

  public abstract readonly fps: number;

  public abstract readonly interruptible: boolean;

  public abstract readonly frameskip: boolean;

  public abstract render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return false;
  }

  public play = async (display: Display) => {
    let frameNumber = 0;
    let spanProgress = 0;
    const start = performance.now();

    if (this.fps < 0 || this.fps > 1000) {
      throw new Error(`Invalid animation frame rate - 0 < ${this.fps} < 1000`);
    }

    await animate(this.fps, this.frameskip, async (skip) => {
      const info = { frameNumber, timestamp: performance.now() - start };
      const frame = await this.render(info);

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
        frameNumber++;
        spanProgress = 0;
      }

      if (skip) frameNumber += skip;

      return await this.playCriteria(info);
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

  public render(info: RenderInformation) {
    return this.data.frames[info.frameNumber % this.data.frames.length];
  }

  public playCriteria(info: RenderInformation) {
    return info.frameNumber < this.data.frames.length;
  }
}

export abstract class AnimeAnimation<T extends string> extends Animation {
  private anime: AnimeInstance;

  constructor(
    params: Pick<
      AnimeParams,
      "targets" | "duration" | "loop" | "easing" | "direction" | T
    >,
  ) {
    super();

    this.anime = anime({
      ...params,
      autoplay: false,
    });
  }

  public render(info: RenderInformation) {
    this.anime.tick(info.timestamp);

    return this.tick(info);
  }

  protected abstract tick(
    info: RenderInformation,
  ): AnimationFrameData | Promise<AnimationFrameData>;
}
