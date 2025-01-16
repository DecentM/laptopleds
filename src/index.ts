import { Display } from "./lib/display";

import { IdleAnimation } from "./animations/idle/idle";

const main = async () => {
  const left = new Display("/dev/ttyACM1");
  const right = new Display("/dev/ttyACM0");

  await Promise.all([left.powerOn(), right.powerOn()]);

  const idle = new IdleAnimation();

  await Promise.all([idle.play(left), idle.play(right)]);

  await Promise.all([left.powerOff(), right.powerOff()]);
};

main();
