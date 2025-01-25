import { Command } from "commander";

import * as Animations from "../animations";
import { SerialPortDisplay } from "../lib/display/serial-port";
import { EmulatedDisplay } from "../lib/display/emulator";

export const program = new Command();

program
  .command("play")
  .argument("<animation>", "Name of the animation to play")
  .option("-d, --device <device>", "Device path to send the animation to")
  .action(async (animationName, options) => {
    const Animation = Object.values(Animations).find(
      (animation) => animation.name === animationName,
    );

    if (!Animation) {
      console.error(`Animation not found: "${animationName}"`);
      return;
    }

    if (!options.device) {
      console.error("-d, --device is required");
      return;
    }

    const animation = new Animation();

    const display =
      options.device === "emulator"
        ? new EmulatedDisplay()
        : new SerialPortDisplay(options.device);

    await display.powerOn();
    await animation.play(display);
    await display.powerOff();
  });
