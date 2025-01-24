export abstract class Display {
  public abstract get brightness(): number;
  public abstract get matrix(): number[][];
  public abstract get power(): boolean;

  public abstract powerOn(drain?: boolean): Promise<void>;
  public abstract powerOff(drain?: boolean): Promise<void>;
  public abstract setBrightness(
    brightness: number,
    drain?: boolean,
  ): Promise<void>;
  public abstract draw(matrix: number[][], drain?: boolean): Promise<void>;
  public abstract drain(): Promise<void>;
}
