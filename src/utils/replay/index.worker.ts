import { HZ } from "@/constants";
import type { MaybeArray, PlayState, ReplayerWorker, Request } from "@/typings";
import { formatMsg, transform_MS } from "@/utils";

const DUMP_MS = 1000 / HZ;
const postMsg = (msg: MaybeArray<ReplayerWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

const getKeyByTime = (timestamp: number) => {
  return Math.floor(transform_MS(timestamp) / DUMP_MS);
};

class Player {
  #initialized = false;

  startTime = 0;
  endTime = 0;
  currentTime = 0;

  #speed = 1;

  #cacheData = new Map<number, string[]>();

  #playTimer = 0;

  #playState: PlayState = "pause";
  get playState() {
    return this.#playState;
  }
  set playState(state: PlayState) {
    if (state !== this.#playState) {
      this.#playState = state;
      postMsg({
        type: "playstatechange",
        data: state
      });
    }
  }

  init(files: File[]): void;
  init(url: string, params?: Record<string, any>): void;
  init(input: File[] | string, params?: Record<string, any>) {
    if (this.#initialized) return;
    this.#initialized = true;
    let requestWorker: Worker | null = new Worker(
      new URL("./request.worker.ts", import.meta.url),
      {
        type: "module"
      }
    );
    requestWorker.onmessage = (ev: MessageEvent<Request.OnMessage>) => {
      const { type, data } = ev.data;
      if (type === "durationchange") {
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        postMsg({ type, data });
      } else if (type === "response") {
        const lines = data.text.split("\n");
        this.#mergeFrames(lines);
        postMsg({
          type: "loadstate",
          data: {
            state: "loading",
            current: data.current,
            total: data.total
          }
        });
      } else if (type === "finish") {
        requestWorker?.terminate();
        requestWorker = null;
      }
    };
    if (Array.isArray(input)) {
      requestWorker.postMessage({
        type: "files",
        data: input
      });
    } else {
      requestWorker.postMessage({
        type: "request",
        data: {
          url: input,
          params
        }
      });
    }

    this.start();
  }

  start(timestamp = this.startTime) {
    if (!this.#initialized) return;
    this.currentTime = timestamp;

    let playIndex = -1;
    let playKey = 0;
    let accumulatedTime = 0;

    this.#playTimer = setInterval(() => {
      if (playIndex === -1) {
        this.playState = "loading";
        const key = getKeyByTime(this.currentTime || this.startTime);
        playIndex = [...this.#cacheData.keys()].indexOf(key);
        playKey = key;
        return;
      }
      if (this.endTime && this.currentTime >= this.endTime) {
        this.playState = "end";
        clearInterval(this.#playTimer);
        return;
      }
      if (playIndex >= this.#cacheData.size) {
        this.playState = "loading";
        return;
      }
      accumulatedTime += DUMP_MS * this.#speed;

      this.playState = "play";
      while (accumulatedTime >= DUMP_MS) {
        if (this.currentTime >= this.endTime) {
          this.playState = "end";
          clearInterval(this.#playTimer);
          return;
        }
        if (playIndex >= this.#cacheData.size) {
          this.playState = "loading";
          return;
        }
        const lines = this.#cacheData.get(playKey);
        if (lines) {
          this.play(lines);
          playIndex++;
        }

        playKey++;
        accumulatedTime -= DUMP_MS;
      }
    }, DUMP_MS);
  }

  play(lines: string[]) {
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return;
      const data = line.slice(colonIndex + 1);
      if (data[0] === "{") {
        const res = formatMsg(data);
        if (res) {
          postMsg({
            type: "data",
            data: res
          });
        }
      } else {
        const jsonData = atob(data);
        try {
          let data;
          if (jsonData[0] === "{") {
            data = jsonData;
          } else {
            const uint8buffer = new Uint8Array(jsonData.length);
            for (let i = 0; i < jsonData.length; i++) {
              uint8buffer[i] = jsonData.charCodeAt(i);
            }
            data = uint8buffer.buffer;
          }
          data = formatMsg(data);
          if (data) {
            postMsg({
              type: "data",
              data
            });
          }
        } catch (error) {
          // console.log(error);
        }
      }
    });
    const lastLine = lines[lines.length - 1];
    const colonIndex = lastLine.indexOf(":");
    const timestamp = +lastLine.slice(0, colonIndex);
    this.currentTime = transform_MS(timestamp);
    postMsg({
      type: "timeupdate",
      data: this.currentTime - this.startTime
    });
  }

  pause() {
    this.playState = "pause";
    clearInterval(this.#playTimer);
  }

  /** 单帧数据并不是全量数据, 将导致渲染结果不完整且有上一帧残留, 最佳使用方式是播放到某一时刻,再跳转上/下帧 */
  jump(jumpTimestamp: number) {
    if (!this.#initialized) return;
    const needTimer = this.playState === "play" || this.playState === "loading";
    if (needTimer) this.pause();
    this.currentTime = jumpTimestamp;

    if (this.endTime && this.currentTime >= this.endTime) {
      this.playState = "end";
    } else {
      this.playState = needTimer ? "play" : "pause";
    }
    let playKey = getKeyByTime(this.currentTime);
    while (!this.#cacheData.has(playKey)) {
      playKey++;
    }
    const lines = this.#cacheData.get(playKey);
    if (lines) this.play(lines);

    console.log(
      `play frame: ${[...this.#cacheData.keys()].indexOf(playKey)}/${this.#cacheData.size - 1}`
    );
    if (needTimer) this.start(this.currentTime);
  }

  setSpeed(speed: number) {
    this.#speed = speed;
    if (this.playState === "play") {
      clearInterval(this.#playTimer);
      this.start(this.currentTime);
    }
  }

  #mergeFrames(lines: string[]) {
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return;
      const timestamp = +line.slice(0, colonIndex);
      const key = getKeyByTime(timestamp);
      const cacheLines = this.#cacheData.get(key);
      if (!cacheLines) {
        this.#cacheData.set(key, [line]);
      } else {
        cacheLines.push(line);
      }
    });
  }

  reset() {
    postMsg([
      {
        type: "timeupdate",
        data: 0
      },
      {
        type: "durationchange",
        data: {
          startTime: 0,
          endTime: 0
        }
      },
      {
        type: "loadstate",
        data: {
          state: "loadend",
          current: 0,
          total: 0
        }
      }
    ]);

    this.pause();
    this.#speed = 1;
    this.#cacheData.clear();

    this.startTime = 0;
    this.endTime = 0;
    this.currentTime = 0;

    this.#playTimer = 0;

    this.#initialized = false;
  }
}

const player = new Player();

onmessage = async (ev: MessageEvent<ReplayerWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "files") {
    player.init(data);
  } else if (type === "request") {
    player.init(data.url, data.params);
  } else if (type === "playstate") {
    if (data.state === "play") {
      player.start(data.currentDuration + player.startTime);
    } else if (data.state === "pause") {
      player.pause();
    }
  } else if (type === "timeupdate") {
    player.jump(data + player.startTime);
  } else if (type === "playrate") {
    player.setSpeed(data);
  } else if (type === "reset") {
    player.reset();
  }
};
