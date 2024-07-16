import log from "../log";
import WebsocketServer from "./websocket_server";

function deduceWebsocketServerAddr(path: string) {
  const port = location.port;
  const server = port === "3000" ? `${location.hostname}:8082` : location.host;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const ws_addr = `${protocol}://${server}/${path}`;
  log.success("websocket addr", ws_addr);
  // return ws_addr;
  return "ws://10.8.33.21:8082/" + path;
}

const url = deduceWebsocketServerAddr("clientPilot");

export const VIEW_WS = new WebsocketServer(url);
