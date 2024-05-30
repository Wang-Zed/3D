import { VIEW_WS } from "../websocket";
import {
  PlayState,
  type WorkerRequestDataType,
  type WorkerResponseDataType
} from "./type";

export const playRateOptions = [
  { label: "x0.5", value: 0.5 },
  { label: "x1.0", value: 1.0 },
  { label: "x1.5", value: 1.5 },
  { label: "x2.0", value: 2.0 }
];

class ReplayStore {
  worker?: Worker;

  duration = 0;
  currentDuration = 0;

  playState = PlayState.Paused;
  playRate = 1.0;

  initialize(files: FileList) {
    this.worker = new Worker(new URL("./new.worker.ts", import.meta.url));
    this.worker.onmessage = this.workerMsg.bind(this);
    this.postMessage({
      type: "data",
      data: files
    });
  }

  postMessage(msg: WorkerRequestDataType) {
    this.worker?.postMessage(msg);
  }

  workerMsg(msg: MessageEvent<WorkerResponseDataType>) {
    if (!msg.data) return;
    const { type, data } = msg.data;
    if (type === "data") {
      VIEW_WS.dispatchTargetMsg(data.topic, data.data);
    } else if (type === "duration") {
      if (data.total) {
        this.duration = data.total;
      }
      if (data.current) {
        this.currentDuration = data.current;
      }
    }
  }

  setCurrentDuration(currentDuration: number) {
    this.currentDuration = currentDuration;
    this.setPlayState(PlayState.Playing, currentDuration);
  }

  setPlayState(playState: PlayState, timeOffset?: number) {
    this.playState = playState;
    this.postMessage({
      type: "playState",
      data: {
        playState,
        timeOffset
      }
    });
  }

  setPlayRate(playRate: number) {
    this.playRate = playRate;
    this.postMessage({
      type: "playRate",
      data: playRate
    });
  }

  dispose() {
    this.worker?.terminate();
    this.duration = 0;
    this.currentDuration = 0;
    this.playState = PlayState.Paused;
    this.playRate = 1.0;
  }
}

const replayStore = new ReplayStore();
export default replayStore;
