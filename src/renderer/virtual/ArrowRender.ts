import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Arrow, type ArrowUpdateData } from "../common";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.arrow)[number];

export default class ArrowRender extends Arrow {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (
        topic === ALL_TOPICS.LOCALIZATION_GLOBAL_HISTORY_TRAJECTORY ||
        topic === ALL_TOPICS.LOCALIZATION_LOCAL_HISTORY_TRAJECTORY ||
        topic === ALL_TOPICS.CAR_TRAJECTORY ||
        topic === ALL_TOPICS.LOCALMAP_MSG_LANE_LINK ||
        topic === ALL_TOPICS.DR_TRAJECTORY ||
        topic === ALL_TOPICS.GLOBAL_TRAJECTORY
      ) {
        return (data: { data: ArrowUpdateData; topic: TOPIC_TYPE }) => {
          this.update(data.data);
        };
      } else if (topic === ALL_TOPICS.FUSION_GOP) {
        return (data: {
          data: { heading_arrow_array: ArrowUpdateData };
          topic: TOPIC_TYPE;
        }) => {
          this.update(data.data.heading_arrow_array);
        };
      }
      return (data: {
        data: { arrow_array: ArrowUpdateData };
        topic: TOPIC_TYPE;
      }) => {
        this.update(data.data.arrow_array);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
