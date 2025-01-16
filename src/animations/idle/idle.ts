import { JsonAnimation } from "../../lib/animation";
import data from "./data.json";

export class IdleAnimation extends JsonAnimation {
  constructor() {
    super(data);
  }
}
