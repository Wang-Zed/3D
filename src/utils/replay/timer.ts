import { binarySearch } from "..";

export interface Action {
  /** 距开始时间的延迟: 毫秒ms */
  delay: number;
  doAction: () => void;
}

export class Timer {
  timeOffset = 0;
  speed = 1;

  private actions: Action[] = [];
  private raf: number | true | null = null;
  private lastTimestamp = 0;

  /** 是否有任务 */
  get actionsLength() {
    return this.actions.length;
  }

  /** 是否正在运行 */
  get isActive() {
    return this.raf !== null;
  }

  /** 是否暂停 */
  get isPaused() {
    return !this.isActive && this.actionsLength;
  }

  addAction(action: Action) {
    if (
      !this.actionsLength ||
      this.actions[this.actions.length - 1].delay < action.delay
    ) {
      this.actions.push(action);
    } else {
      const index = binarySearch(
        this.actions,
        (item) => item.delay - action.delay
      );
      this.actions.splice(index, 0, action);
    }
    if (this.raf === true) {
      this.lastTimestamp = performance.now();
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
  }

  start(timeOffset = 0) {
    this.timeOffset = timeOffset;
    this.lastTimestamp = performance.now();
    this.raf = requestAnimationFrame(this.rafCheck.bind(this));
  }

  private rafCheck() {
    const time = performance.now();
    this.timeOffset += (time - this.lastTimestamp) * this.speed;
    this.lastTimestamp = time;
    while (this.actionsLength) {
      const action = this.actions[0];
      if (this.timeOffset >= action.delay) {
        this.actions.shift();
        action.doAction();
      } else {
        break;
      }
    }
    if (this.actionsLength) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    } else {
      this.raf = true;
    }
  }

  stop() {
    if (this.raf) {
      if (this.raf !== true) {
        cancelAnimationFrame(this.raf);
      }
      this.raf = null;
    }
  }

  clear() {
    this.stop();
    this.actions.length = 0;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }
}
