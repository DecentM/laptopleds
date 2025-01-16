import { delay } from "./delay";

export const animate = async (
  fps: number,
  frameskip: boolean,
  callback: (skip: number) => boolean | Promise<boolean>,
) => {
  let running = true;
  let skip = 0;
  let error = 0;

  while (running) {
    const frameStart = performance.now();
    running = await callback(skip);
    skip = 0;
    const frameEnd = performance.now();
    const frameTime = frameEnd - frameStart;

    error += 1000 / fps - frameTime;

    if (error > 0) {
      const delayStart = performance.now();
      await delay(error);
      error -= performance.now() - delayStart;
    } else if (error < -1000 / fps && frameskip) {
      skip = Math.floor(-error / (1000 / fps));
      error += skip * (1000 / fps);
    } else if (error < -1000 / fps) {
      console.warn(
        "Animation is running too slow, but frameskip is disabled! Current lag: %sms",
        error.toFixed(2),
      );
    }
  }
};
