import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { Freespace, type FreespaceUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.freespace)[number];

export default class FreespaceRender extends Freespace {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: FreespaceUpdateData; topic: TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
