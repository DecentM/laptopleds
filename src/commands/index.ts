import { Command } from "commander";

import * as Animations from "../animations";
import { Display } from "../lib/display";

export const program = new Command();

program
  .command("play")
  .argument("<animation>", "Name of the animation to play")
  .option("-d, --device <device>", "Device path to send the animation to")
  .action(async (animationName, options) => {
    const Animation = Animations[animationName as keyof typeof Animations];

    if (!Animation) {
      console.error(`Animation not found: "${animationName}"`);
      return;
    }

    if (!options.device) {
      console.error("-d, --device is required");
      return;
    }

    const animation = new Animation();

    const display = new Display(options.device);

    await display.powerOn();
    await animation.play(display);
    await display.powerOff();
  });
