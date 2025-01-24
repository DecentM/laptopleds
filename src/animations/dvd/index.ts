import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import anime from "animejs";

import {
  BlankScreen,
  LowercaseLetters,
  Numbers,
  Symbols,
  UppercaseLetters,
} from "../../icons";
import { composite } from "../../lib/composite";

const All = [
  ...Object.values(UppercaseLetters),
  ...Object.values(LowercaseLetters),
  ...Object.values(Numbers),
  ...Object.values(Symbols),
].sort(() => Math.random() - 0.5);

export class DvdAnimation extends Animation {
  public fps = 4;

  public frameskip = true;

  public interruptible = true;

  public name = "dvd";

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  public init(info: RenderInformation): Promise<void> | void {
    return;
  }

  private state = { index: 0, x: 0, y: 0 };

  private anime = anime
    .timeline({
      targets: this.state,
      loop: true,
      direction: "forward",
      autoplay: false,
      round: 1,
      easing: "linear",
    })
    .add({
      index: All.length - 1,
      duration: 60000,
    });

  private xVel = 2 / this.fps;

  private yVel = 2 / this.fps;

  private stepDvd() {
    this.state.x += this.xVel;
    this.state.y += this.yVel;

    if (this.state.x <= 0 || this.state.x >= 6) {
      this.xVel *= -1;
    }

    if (this.state.y <= 0 || this.state.y >= 29) {
      this.yVel *= -1;
    }
  }

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    this.anime.tick(info.timestamp);

    this.stepDvd();

    const matrix = composite(BlankScreen, All[this.state.index], [
      Math.round(this.state.y),
      Math.round(this.state.x),
    ]);

    return {
      matrix,
      brightness: (Math.log(info.brightness + 1) + 1) * 20,
      span: 1,
    };
  }
}
