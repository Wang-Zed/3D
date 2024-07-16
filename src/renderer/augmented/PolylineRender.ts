import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Polyline, type PolylineUpdateData } from "../common";

type TOPIC_TYPE = (typeof AUGMENTED_RENDER_MAP.polyline)[number];

export default class PolylineRender extends Polyline {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: PolylineUpdateData; topic: TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
