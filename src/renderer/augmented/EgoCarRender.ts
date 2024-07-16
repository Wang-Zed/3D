import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { EgoCar, type EgoCarUpdateData } from "../common";

type TOPIC_TYPE = (typeof AUGMENTED_RENDER_MAP.car_pose)[number];

export default class EgoCarRender extends EgoCar {
  topic: TOPIC_TYPE;

  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(topic, (data: { data: EgoCarUpdateData; topic: TOPIC_TYPE }) => {
      this.update(data.data);
    });
  }
}
