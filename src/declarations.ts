export type AnimationFrame = {
  brightness: number;
  span: number;
  matrix: number[][];
};

export type Animation = {
  name: string;
  fps: number;
  interruptible: boolean;
  frameskip: boolean;
  frames: AnimationFrame[];
};
