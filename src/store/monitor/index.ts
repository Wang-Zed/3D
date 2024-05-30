import { VIEW_WS } from "../websocket";

class Monitor {
  fps: number;
  onlineList: string[];
  constructor() {
    this.fps = 0;
    this.onlineList = [];

    VIEW_WS.registerTargetMsg("conn_list", this.updateOnlineList.bind(this));
  }

  updateFps() {
    this.fps++;
  }

  resetFps() {
    this.fps = 0;
  }

  updateOnlineList(data: { conn_list?: string[] }) {
    this.onlineList = data.conn_list || [];
  }
}

const monitor = new Monitor();

export default monitor;
