import anime, { type AnimeInstance } from "animejs";

import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";

import { Battery } from "../../icons";
import { compositeMany } from "../../lib/composite";
import { rotateMatrix } from "../../lib/rotate-matrix";

import { textToMatrix } from "../../lib/text-to-matrix";

import CircleData from "./circle.json";
import CheckmarkAppearData from "./checkmark-appear.json";

export class ChargingAnimation extends Animation {
  public fps = 40;

  public frameskip = true;

  public interruptible = false;

  public name = "idle";

  private _finished = false;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return !this._finished;
  }

  public init(info: RenderInformation): Promise<void> | void {
    this.state = {
      batteryX: -7,
      batteryY: 15,
      pctX: 1,
      pctY: 34,
      circleProgress: 0,
      checkmarkProgress: 0,
      brightness: Math.log(info.brightness) * 20,
    };

    this.anime = anime
      .timeline({
        targets: this.state,
        direction: "forward",
        autoplay: false,
        loop: false,
        round: 1,
      })
      .add({
        circleProgress: CircleData.frames.length - 1,
        easing: "easeOutQuart",
      })
      .add(
        {
          batteryX: 1,
          easing: "easeOutQuart",
          duration: 600,
        },
        "-=900",
      )
      .add(
        {
          batteryY: 2,
          easing: "easeInOutQuart",
          duration: 600,
        },
        "-=900",
      )
      .add(
        {
          pctY: 15,
          pctX: 1,
          checkmarkProgress: CheckmarkAppearData.frames.length - 1,
          easing: "easeOutQuart",
          duration: 600,
        },
        "-=600",
      )
      .add(
        {
          brightness: 0,
          duration: 1000,
        },
        "+=2500",
      );

    this.anime.finished.then(() => {
      this._finished = true;
    });
  }

  private state: {
    batteryX: number;
    batteryY: number;
    pctX: number;
    pctY: number;
    circleProgress: number;
    checkmarkProgress: number;
    brightness: number;
  } | null = null;

  private anime: AnimeInstance | null = null;

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    if (this.state === null || this.anime === null) {
      return {
        matrix: [],
        brightness: 0,
        span: 1,
      };
    }

    this.anime.tick(info.timestamp);

    const matrix = compositeMany([
      [CircleData.frames[this.state.circleProgress], [0, 0]],
      [rotateMatrix(Battery), [this.state.batteryY, this.state.batteryX]],
      info.battery === 1
        ? [CheckmarkAppearData.frames[this.state.checkmarkProgress], [15, 2]]
        : [
            textToMatrix(`${Math.round(info.battery * 100)}`),
            [this.state.pctY, this.state.pctX],
          ],
    ]);

    return {
      matrix,
      brightness: this.state.brightness,
      span: 1,
    };
  }
}
