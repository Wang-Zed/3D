import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { Obstacle, type ObstacleUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type TOPIC_TYPE = (typeof AUGMENTED_RENDER_MAP.obstacleModel)[number];

export default class ObstacleRender extends Obstacle {
  topic: TOPIC_TYPE;

  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: ObstacleUpdateData; topic: TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
