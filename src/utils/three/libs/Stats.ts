import EventEmitter from "eventemitter3";

interface Events {
  frame: (time: number) => void;
  fps: (fps: number) => void;
  memory: (memory: Memory) => void;
}

export default class Stats extends EventEmitter<Events> {
  frames = 0;

  #beginTime = 0;

  #prevTime = 0;

  static Date = performance || Date;

  static get memory() {
    return window.performance.memory;
  }

  begin() {
    this.#beginTime = Stats.Date.now();
  }

  end() {
    this.frames++;
    const time = Stats.Date.now();
    this.emit("frame", time - this.#beginTime);
    if (time - this.#prevTime >= 1000) {
      this.emit("fps", this.frames);
      this.#prevTime = time;
      this.frames = 0;

      if (Stats.memory) {
        this.emit("memory", Stats.memory);
      }
    }
    return time;
  }

  update() {
    this.#beginTime = this.end();
  }

  dispose() {
    this.removeAllListeners();
  }
}
