import EventEmitter from "eventemitter3";

import { ALL_TOPICS } from "@/constants/topic";
import type { TopicEvent } from "@/typings";
import { formatMsg } from "@/utils";

import log from "../log";

class WebsocketServer extends EventEmitter<TopicEvent> {
  url: string;
  websocket: WebSocket | null;
  reconnectInterval?: number;
  isConnection: boolean;
  allow_reconnect?: boolean;

  allTopics = new Set(Object.values(ALL_TOPICS));
  noSubscriptions = new Set<string | symbol>();
  unknownTopics = new Set<string | symbol>();

  constructor(url: string) {
    super();

    this.url = url;

    this.websocket = null;
    this.isConnection = false;
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
    if (data) this.emit(data.topic, data);
  };

  emit(event: ALL_TOPICS, data: any): boolean {
    // 没有被订阅的topic
    if (this.eventNames().indexOf(event) === -1) {
      if (this.allTopics.has(event)) {
        if (!this.noSubscriptions.has(event)) {
          this.noSubscriptions.add(event);
          log.warning(event, "is not subscribed");
        }
      } else if (!this.unknownTopics.has(event)) {
        this.unknownTopics.add(event);
        log.danger(event, "is not defined");
        console.log(data);
      }

      return false;
    }

    return super.emit(event, data);
  }

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

  dispose() {
    this.removeAllListeners();
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
