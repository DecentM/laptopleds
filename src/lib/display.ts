import { SerialPort } from "serialport";

import { createArray } from "./array";
import { Command } from "../declarations";
import { invertMatrix } from "./invert-matrix";
import { BlankScreen } from "../icons/blank-screen";
import { composite } from "./composite";

export class Display {
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

      this.port.write(data);

      if (drain)
        this.port.drain((error) => (error ? reject(error) : resolve()));
      else resolve();
    });
  }

  public async powerOn(drain = true) {
    await this.port.open();
    await this.sendCommand(Command.Sleep, [0], drain);
    this._power = true;
    await this.draw([]);
    await this.setBrightness(255);
  }

  public async powerOff(drain = true) {
    await this.draw([]);
    await this.setBrightness(0);
    await this.sendCommand(Command.Sleep, [1], drain);
    this._power = false;
    await this.port.close();
  }

  private lastDraw = 0;

  public async draw(
    layers: Array<{ matrix: number[][]; pos: [number, number] }>,
    drain = true,
  ) {
    let screen = BlankScreen;

    for (const layer of layers) {
      screen = composite(screen, layer.matrix, layer.pos);
    }

    const matrix = invertMatrix(screen);

    if (
      matrix.length === this.height &&
      matrix[0].length === this.width &&
      matrix.every((row, y) =>
        row.every((cell, x) => cell === this._matrix[y][x]),
      )
    ) {
      if (performance.now() - this.lastDraw < 50000) return;
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
    this.lastDraw = performance.now();
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

  public async setPixels(
    pixels: { x: number; y: number; value: number }[],
    drain = true,
  ) {
    for (const { x, y, value } of pixels) {
      this._matrix[y][x] = value;
    }

    await this.draw(
      [
        {
          matrix: this._matrix,
          pos: [0, 0],
        },
      ],
      drain,
    );
  }

  public async drain() {
    return new Promise<void>((resolve) => {
      this.port.drain(() => resolve());
    });
  }
}
