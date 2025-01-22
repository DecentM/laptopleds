import {
  Animation,
  AnimeAnimation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import anime from "animejs";

import { Battery, BlankScreen } from "../../icons";
import { composite } from "../../lib/composite";
import { rotateMatrix } from "../../lib/rotate-matrix";

export class IdleAnimation extends Animation {
  public fps = 40;

  public frameskip = true;

  public interruptible = true;

  public name = "idle";

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  private state = { position: 10 };

  private anime = anime({
    targets: this.state,
    position: 19,
    easing: "easeInOutQuart",
    round: 1,
    duration: 2000,
    loop: true,
    direction: "alternate",
    autoplay: false,
  });

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    this.anime.tick(info.timestamp);

    const matrix = composite(BlankScreen, rotateMatrix(Battery), [
      this.state.position,
      1,
    ]);

    return {
      matrix,
      brightness: 50,
      span: 1,
    };
  }
}
