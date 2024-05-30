export enum PlayState {
  Playing = "playing",
  Paused = "paused"
}

interface RequestData {
  type: "data";
  data: FileList;
}
interface RequestPlaystate {
  type: "playState";
  data: {
    playState: PlayState;
    timeOffset?: number;
  };
}
interface RequestPlayRate {
  type: "playRate";
  data: number;
}
export type WorkerRequestDataType =
  | RequestData
  | RequestPlaystate
  | RequestPlayRate;

export interface LineData {
  topic: string;
  data: any;
}

export interface ResponseData {
  type: "data";
  data: LineData;
}

export interface PlayDuration {
  total?: number;
  current?: number;
}

interface ResponseDuration {
  type: "duration";
  data: PlayDuration;
}

export type WorkerResponseDataType = ResponseData | ResponseDuration;
