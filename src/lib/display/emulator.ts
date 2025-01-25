import { createArray } from "../array";

import { Display } from ".";
import { delay } from "../delay";

export class EmulatedDisplay extends Display {
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
    public width = 9,
    public height = 34,
  ) {
    super();

    this.powerOff();

    this._matrix = createArray<number>(this.height, this.width);
  }

  public async powerOn(drain = false) {
    console.clear();

    this.draw(createArray<number>(this.height, this.width));

    await delay(Math.random() * 1000); // Simulate boot time

    this._power = true;
    this.draw(createArray<number>(this.height, this.width));
  }

  public async powerOff(drain = false) {
    console.clear();
    this._power = false;

    this.draw(createArray<number>(this.height, this.width));
  }

  public async setBrightness(brightness: number, drain = false) {
    this._brightness = brightness;
  }

  private printStatus() {
    console.log();
    console.log(`Power: ${this._power ? "On" : "Off"}`);
    console.log(`Brightness: ${this._brightness}`);
  }

  private lastDraw = 0;

  private lastBrightness = 0;

  public async draw(matrix: number[][], drain = false) {
    if (
      matrix.length === this.height &&
      matrix[0].length === this.width &&
      matrix.every((row, y) =>
        row.every((cell, x) => cell === this._matrix[y][x]),
      ) &&
      this._brightness === this.lastBrightness &&
      this._power
    ) {
      if (performance.now() - this.lastDraw < 50000) return;
    }

    console.clear();

    console.log(`\x1b[48;2;0;0;0m┌${"─".repeat(this.width * 2)}┐\x1b[0m`);

    for (let y = 0; y < this.height; y++) {
      process.stdout.write("\x1b[48;2;0;0;0m│");

      for (let x = 0; x < this.width; x++) {
        const value = matrix[y][x];

        if (value === 0) {
          process.stdout.write("  ");
        } else {
          process.stdout.write(
            `\x1b[48;2;${this._brightness};${this._brightness};${this._brightness}m  \x1b[48;2;0;0;0m`,
          );
        }
      }

      process.stdout.write("│\x1b[0m\n");
    }

    console.log(`\x1b[48;2;0;0;0m└${"─".repeat(this.width * 2)}┘\x1b[0m`);

    this.printStatus();

    this._matrix = matrix;
    this.lastDraw = performance.now();
    this.lastBrightness = this._brightness;
  }

  public async drain() {
    // No-op
  }
}
