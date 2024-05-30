import { formatMsg } from "@/utils/ws";

class WebsocketServer {
  url: string;
  websocket: WebSocket | null;
  reconnectInterval?: number;
  isConnection: boolean;
  allow_reconnect?: boolean;

  target_msg_map: Record<string, (data: any) => void>;

  constructor(url: string) {
    this.url = url;

    this.websocket = null;
    this.isConnection = false;

    this.target_msg_map = {};
  }

  initialize() {
    this.allow_reconnect = true;
    if (this.isConnection) return;
    this.isConnection = true;

    if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
      this.websocket = new WebSocket(this.url);
    }
    this.websocket.binaryType = "arraybuffer";

    this.websocket.onmessage = this.onMessage;
    this.websocket.onopen = this.onOpen;
    this.websocket.onclose = this.onClose;
    this.websocket.onerror = this.onError;
  }

  onMessage: WebSocket["onmessage"] = (event) => {
    const data = formatMsg(event.data);
    if (data) {
      this.dispatchTargetMsg(data.topic, data.data);
    }
  };

  onOpen: WebSocket["onopen"] = () => {
    clearTimeout(this.reconnectInterval);
    this.isConnection = true;
  };

  onClose: WebSocket["onclose"] = (data) => {
    switch (data.code) {
      case 1000: {
        // 主动关闭
        break;
      }
      default: {
        this.reconnect();
        break;
      }
    }
    this.reconnect();
  };

  onError: WebSocket["onerror"] = () => {
    this.reconnect();
  };

  reconnect() {
    clearTimeout(this.reconnectInterval);
    if (!this.allow_reconnect) return;
    this.reconnectInterval = window.setTimeout(() => {
      this.isConnection = false;
      this.initialize();
    }, 1000);
  }

  registerTargetMsg<T>(topic: string, callback: (data: T) => void) {
    this.target_msg_map[topic] = callback;
  }

  dispatchTargetMsg<T>(topic: string, data: T) {
    this.target_msg_map[topic]?.(data);
  }

  dispose() {
    this.isConnection = false;
    this.allow_reconnect = false;
    clearTimeout(this.reconnectInterval);
    if (this.websocket) {
      if (this.websocket.readyState === WebSocket.OPEN) {
        this.websocket?.close(1000, "dispose");
      }
    }
  }
}

export default WebsocketServer;
