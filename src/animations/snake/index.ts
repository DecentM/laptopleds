import { BlankScreen } from "../../icons";
import {
  Animation,
  type AnimationFrameData,
  type RenderInformation,
} from "../../lib/animation";
import { createArray } from "../../lib/array";
import { compositeMany } from "../../lib/composite";

export class SnakeAnimation extends Animation {
  public static name = "snake";

  public fps = 24;

  public frameskip = true;

  public interruptible = false;

  private gameOver = false;

  public playCriteria(info: RenderInformation): Promise<boolean> | boolean {
    return true;
  }

  private spawnFood(): void {
    const x = Math.floor(Math.random() * 34);
    const y = Math.floor(Math.random() * 9);

    if (this.snake.includes(y + x * 9)) {
      this.spawnFood();
      return;
    }

    this.food = [x, y];
  }

  private startGame(): void {
    this.snake = [Math.floor(Math.random() * 34 * 9)];
    this.direction = ["up", "down", "left", "right"][
      Math.floor(Math.random() * 4)
    ] as "up" | "down" | "left" | "right";
    this.gameOver = false;
    this.spawnFood();
  }

  public init(info: RenderInformation): Promise<void> | void {
    this.startGame();
  }

  private snake: number[] = [];

  private direction: "up" | "down" | "left" | "right" = "down";

  private food: [number, number] | null = null;

  private renderSnake(): number[][] {
    const matrix = createArray<number>(34, 9);

    for (const i of this.snake) {
      matrix[Math.floor(i / 9)][i % 9] = 1;
    }

    return matrix;
  }

  private think(): void {
    if (!this.food) {
      return;
    }

    const head = this.snake[this.snake.length - 1];
    const headX = Math.floor(head / 9);
    const headY = head % 9;

    const [foodX, foodY] = this.food;

    // Define possible directions with their respective movements
    const directions: Record<
      "up" | "down" | "left" | "right",
      [number, number]
    > = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    // Helper to calculate the next position based on direction
    const getNextPosition = (
      dir: "up" | "down" | "left" | "right",
    ): [number, number] => {
      const [dx, dy] = directions[dir];
      return [headX + dx, headY + dy];
    };

    // Helper to check if a position is within bounds and not part of the snake
    const isSafe = (x: number, y: number): boolean => {
      if (x < 0 || x >= 34 || y < 0 || y >= 9) return false; // Out of bounds
      const positionIndex = x * 9 + y;
      return !this.snake.includes(positionIndex); // Not part of the snake
    };

    // Prioritize moving toward the food if safe
    let newDirection: "up" | "down" | "left" | "right" | null = null;
    if (
      foodX < headX &&
      this.direction !== "down" &&
      isSafe(headX - 1, headY)
    ) {
      newDirection = "up";
    } else if (
      foodX > headX &&
      this.direction !== "up" &&
      isSafe(headX + 1, headY)
    ) {
      newDirection = "down";
    } else if (
      foodY < headY &&
      this.direction !== "right" &&
      isSafe(headX, headY - 1)
    ) {
      newDirection = "left";
    } else if (
      foodY > headY &&
      this.direction !== "left" &&
      isSafe(headX, headY + 1)
    ) {
      newDirection = "right";
    }

    if (!newDirection || !isSafe(...getNextPosition(newDirection))) {
      // Evaluate alternative directions to avoid running in circles
      const alternatives = ["up", "down", "left", "right"] as const;
      const validDirections = alternatives.filter((dir) =>
        isSafe(...getNextPosition(dir)),
      );

      // Prefer valid directions that lead closer to food
      validDirections.sort((a, b) => {
        const [ax, ay] = getNextPosition(a);
        const [bx, by] = getNextPosition(b);
        const aDist = Math.abs(ax - foodX) + Math.abs(ay - foodY);
        const bDist = Math.abs(bx - foodX) + Math.abs(by - foodY);
        return aDist - bDist;
      });

      // Select the best valid direction deterministically
      newDirection = validDirections[0] || this.direction;
    }

    // If no valid direction, maintain the current direction
    this.direction = newDirection;
  }

  public render(
    info: RenderInformation,
  ): Promise<AnimationFrameData> | AnimationFrameData {
    this.think();

    const head = this.snake[this.snake.length - 1];

    let newHead = head;

    switch (this.direction) {
      case "up":
        newHead -= 9;
        break;
      case "down":
        newHead += 9;
        break;
      case "left":
        newHead -= 1;
        break;
      case "right":
        newHead += 1;
        break;
    }

    if (
      newHead < 0 ||
      newHead >= 34 * 9 ||
      (this.direction === "left" && newHead % 9 === 8) ||
      (this.direction === "right" && newHead % 9 === 0) ||
      this.snake.includes(newHead)
    ) {
      this.gameOver = true;
      this.startGame();

      return {
        brightness: 50,
        matrix: BlankScreen,
      };
    }

    this.snake.push(newHead);

    if (
      this.food &&
      this.food[1] === newHead % 9 &&
      this.food[0] === Math.floor(newHead / 9)
    ) {
      this.spawnFood();
    } else {
      this.snake.shift();
    }

    const matrix = compositeMany([
      [BlankScreen, [0, 0]],
      [this.renderSnake(), [0, 0]],
      this.food ? [[[1]], this.food] : [[[0]], [0, 0]],
    ]);

    // const matrix = composite(BlankScreen, this.renderSnake(), [0, 0]);

    return {
      brightness: 50,
      matrix,
    };
  }
}
