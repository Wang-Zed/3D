import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Text, type TextUpdateData } from "../common";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.text_sprite)[number];

export default class TextRender extends Text {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(topic, (data: { data: TextUpdateData; topic: TOPIC_TYPE }) => {
      this.update(data.data);
    });
  }
}
