import { SerialPort } from "serialport";

import type { Animation } from "./declarations";

import idle from "./animations/idle.json";

enum Command {
  Brightness = 0x00,
  Pattern = 0x01,
  Bootloader = 0x02,
  Sleep = 0x03,
  Animate = 0x04,
  Panic = 0x05,
  Draw = 0x06,
  StageGreyCol = 0x07,
  DrawGreyColBuffer = 0x08,
  SetText = 0x09,
  StartGame = 0x10,
  GameControl = 0x11,
  GameStatus = 0x12,
  SetColor = 0x13,
  DisplayOn = 0x14,
  InvertScreen = 0x15,
  SetPixelColumn = 0x16,
  FlushFramebuffer = 0x17,
  Version = 0x20,
}

const createArray = <T>(length: number, ...args: number[]): T[][] => {
  const arr = new Array(length || 0);
  let i = length;

  if (args.length > 0) {
    while (i--) arr[length - 1 - i] = createArray(args[0], ...args.slice(1));
  }

  return arr;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

class Display {
  private port: SerialPort;

  private _brightness = 0;

  public get brightness() {
    return this._brightness;
  }

  private _matrix: number[][];

  public get matrix() {
    return this._matrix;
  }

  private _power = false;

  public get power() {
    return this._power;
  }

  constructor(
    path: string,
    public width = 9,
    public height = 34,
  ) {
    this.port = new SerialPort({ path, baudRate: 115200, autoOpen: false });

    this.port.on("error", (error) => {
      console.error(error);
    });

    this._matrix = createArray<number>(this.height, this.width);
  }

  private sendCommand(commandId: number, params: number[], drain: boolean) {
    return new Promise<void>((resolve, reject) => {
      if (this.port === null) return reject(new Error("Port is not open"));

      const bytes = [0x32, 0xac, commandId, ...params];

      const data = Buffer.from(bytes);

      // console.log(this.path, data.toString("hex"));

      this.port.write(data);

      if (drain)
        this.port.drain((error) => (error ? reject(error) : resolve()));
      else resolve();
    });
  }

  public async powerOn(drain = true) {
    await this.open();
    await this.sendCommand(Command.Sleep, [0], drain);
    this._power = true;
    await this.blank();
    await this.setBrightness(255);
  }

  public async powerOff(drain = true) {
    await this.blank();
    await this.setBrightness(255);
    await this.sendCommand(Command.Sleep, [1], drain);
    this._power = false;
    await this.close();
  }

  public async draw(matrix: number[][], drain = true) {
    if (
      matrix.length === this.height &&
      matrix[0].length === this.width &&
      matrix.every((row, y) =>
        row.every((cell, x) => cell === this._matrix[y][x]),
      )
    ) {
      return;
    }

    const width = matrix[0].length;
    const height = matrix.length;

    const vals = new Array(39).fill(0);

    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const cell = matrix[row][col];
        if (cell === 0) {
          const i = col + row * width;
          vals[Math.trunc(i / 8)] |= 1 << (i % 8);
        }
      }
    }

    await this.sendCommand(Command.Draw, vals, drain);
    this._matrix = matrix;
  }

  public checkFirmwareVersion() {
    return new Promise<{
      major: number;
      minor: number;
      patch: number;
      prod: boolean;
    }>((resolve, reject) => {
      const params: number[] = [];
      const bytes = [0x32, 0xac, Command.Version, ...params];
      const data = Buffer.from(bytes);

      this.port.once("data", (response: Buffer) => {
        const major = response[0];
        const minor = (response[1] & 0xf0) >> 4;
        const patch = response[1] & 0x0f;
        const prod = response[2] !== 1;

        resolve({ major, minor, patch, prod });
      });

      this.port.once("error", (error) => {
        reject(error);
      });

      this.port.write(data);
    });
  }

  public async close() {
    await this.port.close();
  }

  public async open() {
    await this.port.open();
  }

  public async fill(drain = true) {
    const matrix = createArray<number>(this.height, this.width);

    for (let col = 0; col < this.width; col++) {
      for (let row = 0; row < this.height; row++) {
        matrix[row][col] = 0;
      }
    }

    await this.draw(matrix, drain);
  }

  public async blank(drain = true) {
    const matrix = createArray<number>(this.height, this.width);

    for (let col = 0; col < this.width; col++) {
      for (let row = 0; row < this.height; row++) {
        matrix[row][col] = 1;
      }
    }

    await this.draw(matrix, drain);
  }

  public async setBrightness(brightness: number, drain = true) {
    if (brightness === this._brightness) {
      return;
    }

    await this.sendCommand(
      Command.Brightness,
      [Math.max(Math.min(brightness, 255), 0)],
      drain,
    );
    this._brightness = brightness;
  }

  public async setPixels(pixels: { x: number; y: number; value: number }[]) {
    for (const { x, y, value } of pixels) {
      this._matrix[y][x] = value;
    }

    await this.draw(this._matrix);
  }

  public async drain() {
    return new Promise<void>((resolve) => {
      this.port.drain(() => resolve());
    });
  }
}

const animate = async (
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
        "Animation is running too slow, but frameskip is disabled! Current error: %sms",
        error.toFixed(2),
      );
    }
  }
};

const playAnimation = async (
  display: Display,
  animation: Animation,
  criteria?: () => boolean,
) => {
  let frameCount = 0;
  let spanProgress = 0;

  if (animation.fps < 0 || animation.fps > 1000) {
    throw new Error(
      `Invalid animation frame rate - 0 < ${animation.fps} < 1000`,
    );
  }

  await animate(animation.fps, animation.frameskip, async (skip) => {
    const frame = animation.frames[frameCount];

    await Promise.all([
      display.draw(frame.matrix, false),
      display.setBrightness(frame.brightness, false),
    ]);
    await display.drain();

    if (frame.span > spanProgress + 1) {
      spanProgress++;
    } else {
      frameCount++;
      spanProgress = 0;
    }

    if (skip) frameCount += skip;

    if (frameCount >= animation.frames.length) {
      frameCount = frameCount % animation.frames.length;
    }

    const loop = criteria ? criteria() : true;

    return loop || (!animation.interruptible && frameCount > 0);
  });
};

const main = async () => {
  const left = new Display("/dev/ttyACM1");
  const right = new Display("/dev/ttyACM0");

  await Promise.all([left.powerOn(), right.powerOn()]);

  const animationStart = performance.now();
  const animationLengthSeconds = 5;

  const criteria = () =>
    performance.now() - animationStart < animationLengthSeconds * 1000;

  await Promise.all([
    playAnimation(left, idle, criteria),
    playAnimation(right, idle, criteria),
  ]);

  const animationEnd = performance.now();
  console.log(
    `Animation took ${((animationEnd - animationStart) / 1000).toFixed(2)}s`,
  );

  await Promise.all([left.powerOff(), right.powerOff()]);
};

main();
