import { Display } from "./lib/display";

import { IdleAnimation } from "./animations/idle/idle";
import { UptimeAnimation } from "./animations/uptime/uptime";
import { FramecountAnimation } from "./animations/framecount/framecount";

const main = async () => {
  const left = new Display("/dev/ttyACM1");
  const right = new Display("/dev/ttyACM0");

  await Promise.all([left.powerOn(), right.powerOn()]);

  const idle = new IdleAnimation();
  const uptime = new UptimeAnimation();
  const framecount = new FramecountAnimation();

  await Promise.all([framecount.play(left), uptime.play(right)]);

  await Promise.all([left.powerOff(), right.powerOff()]);
};

main();
