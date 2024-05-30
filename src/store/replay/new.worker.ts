import { binarySearch } from "@/utils";
import {
  readFileAsText,
  readFileBothRow,
  readFileFirstRow,
  readFileLastRow
} from "@/utils/file";
import { Timer } from "@/utils/replay/timer";
import { formatMsg } from "@/utils/ws";

import {
  PlayState,
  type WorkerRequestDataType,
  type WorkerResponseDataType
} from "./type";

interface RowType {
  time: string;
  data: string;
}

const parseFile = async (file: File) => {
  const fileData = await readFileAsText(file);
  const lines = fileData.split("\n");
  return lines.map((line) => parseLine(line));
};

const parseLine = (line: string) => {
  const [time, data] = line.split(":");
  return {
    time,
    data
  };
};

const MAX_ACTIONS_LENGTH = 1000;

class FilePlayer {
  timer: Timer;
  files: File[];

  currentFileIndex = 0;
  currentRowIndex = 0;

  processFileTimer: number | null = null;

  startTime = 0;
  endTime = 0;
  preFileEndTime = 0;

  #timeOffset = 0;
  #currentTime = 0;
  get currentTime() {
    return this.#currentTime;
  }
  set currentTime(time: number) {
    this.#currentTime = time;
    if (time - this.#timeOffset > 1000) {
      sendMessage({
        type: "duration",
        data: {
          current: time - this.startTime
        }
      });
      this.#timeOffset = time;
    } else if (time - this.#timeOffset < 0) {
      this.#timeOffset = time;
    }
  }

  constructor() {
    this.timer = new Timer();
    this.files = [];
  }

  init(files: FileList | File[]) {
    const filesArray = Array.from(files);
    filesArray.sort((a, b) => a.name.localeCompare(b.name));
    this.files = filesArray;
    this.readTime().then(async () => {
      sendMessage({
        type: "duration",
        data: {
          total: this.endTime - this.startTime
        }
      });
    });
  }

  play(timeOffset = 0) {
    this.reset();
    this.jumpByTime(timeOffset);
    this.timer.start(timeOffset);
  }

  pause() {
    this.timer.stop();
  }

  reset() {
    this.timer.clear();
    this.currentFileIndex = 0;
    this.currentRowIndex = 0;
    this.currentTime = 0;
    if (this.processFileTimer) {
      clearInterval(this.processFileTimer);
      this.processFileTimer = null;
    }
  }

  setSpeed(speed: number) {
    this.timer.setSpeed(speed);
  }

  async readTime() {
    const startFile = this.files[0];
    const endFile = this.files[this.files.length - 1];
    const penultimateFile = this.files[this.files.length - 2];

    const [startRow, penultimateRow, endRow] = await Promise.all([
      readFileFirstRow(startFile),
      readFileLastRow(penultimateFile),
      readFileLastRow(endFile)
    ]);

    const startTime = +startRow.split(":")[0];
    const preFileEndTime = +penultimateRow.split(":")[0];
    const endTime = +endRow.split(":")[0];

    // 微秒转毫秒
    this.startTime = startTime / 1000;
    this.endTime = endTime / 1000;
    this.preFileEndTime = preFileEndTime / 1000;
  }

  // 指定播放点 & addAction最大数量限制
  async jumpByTime(timeOffset: number) {
    const duration = this.preFileEndTime - this.startTime;
    if (duration && timeOffset > 0) {
      const average = timeOffset / duration;
      let maybeFileIndex = this.files.length - 1;
      if (average < 1) {
        maybeFileIndex = Math.floor(average * (maybeFileIndex - 1));
      }
      let maybeRowIndex = null;
      while (maybeRowIndex === null) {
        const file = this.files[maybeFileIndex];
        const { firstRow, lastRow } = await readFileBothRow(file);
        const fileStartTimeOffset =
          +firstRow.split(":")[0] / 1000 - this.startTime;
        const fileEndTimeOffset =
          +lastRow.split(":")[0] / 1000 - this.startTime;
        if (timeOffset < fileStartTimeOffset) {
          maybeFileIndex--;
        } else if (timeOffset >= fileEndTimeOffset) {
          maybeFileIndex++;
        } else {
          this.currentFileIndex = maybeFileIndex;
          const fileData = await parseFile(file);
          maybeRowIndex = binarySearch(fileData, (row) => {
            const rowTimeOffset = +row.time / 1000 - this.startTime;
            return rowTimeOffset - timeOffset;
          });
          break;
        }
      }
      this.currentRowIndex = maybeRowIndex;
      this.processInterval();
    } else {
      this.currentFileIndex = 0;
      this.currentRowIndex = 0;
      this.processInterval();
    }
  }

  async getFileData(): Promise<RowType[] | null> {
    if (this.currentFileIndex >= this.files.length) return null;
    const file = this.files[this.currentFileIndex];
    const fileData = await parseFile(file);
    if (this.currentRowIndex >= fileData.length) {
      this.currentFileIndex++;
      this.currentRowIndex = 0;
      return await this.getFileData();
    }
    return fileData.slice(
      this.currentRowIndex,
      this.currentRowIndex + MAX_ACTIONS_LENGTH
    );
  }

  processInterval() {
    this.processFileTimer && clearInterval(this.processFileTimer);
    this.processFileTimer = self.setInterval(async () => {
      if (!this.timer.isActive || this.currentFileIndex >= this.files.length) {
        this.processFileTimer && clearInterval(this.processFileTimer);
        return;
      }
      if (this.timer.actionsLength < MAX_ACTIONS_LENGTH) {
        const fileData = await this.getFileData();
        if (!fileData) {
          this.processFileTimer && clearInterval(this.processFileTimer);
          return;
        }
        this.processFile(fileData);
        this.currentRowIndex += MAX_ACTIONS_LENGTH;
      }
    }, 200);
  }

  processFile(rows: RowType[]) {
    for (const row of rows) {
      if (!row) continue;
      let jsonData = "";
      try {
        jsonData = atob(row.data);
      } catch (error) {
        continue;
      }
      const currentTime = +row.time / 1000;
      const action = {
        delay: currentTime - this.startTime,
        doAction: () => {
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
              sendMessage({
                type: "data",
                data
              });
              this.currentTime = currentTime;
            }
          } catch (error) {
            // console.log(error);
          }
        }
      };
      this.timer.addAction(action);
    }
  }
}

const filePlayer = new FilePlayer();

function sendMessage(msg: WorkerResponseDataType) {
  postMessage(msg);
}

addEventListener("message", (message: MessageEvent<WorkerRequestDataType>) => {
  const { type, data } = message.data;
  if (type === "data") {
    filePlayer.init(data);
  } else if (type === "playRate") {
    filePlayer.setSpeed(data);
  } else if (type === "playState") {
    if (data.playState === PlayState.Playing) {
      filePlayer.play(data.timeOffset);
    } else {
      filePlayer.pause();
    }
  }
});
