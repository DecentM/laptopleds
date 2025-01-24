import { Display } from "./lib/display/serial-port";

const main = async () => {
  const left = new Display("/dev/ttyACM1");
  const right = new Display("/dev/ttyACM0");

  await Promise.all([left.powerOn(), right.powerOn()]);

  await Promise.all([left.powerOff(), right.powerOff()]);
};

main();
