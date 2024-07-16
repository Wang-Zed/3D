import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Target, type TargetUpdateData } from "../common";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.target)[number];

export default class TargetRender extends Target {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (
        topic === ALL_TOPICS.DPC_PLANNING_DEBUG_INFO ||
        topic === ALL_TOPICS.SCENARIO_MODEL_DEBUG ||
        topic === ALL_TOPICS.PLANNING_INFO ||
        topic === ALL_TOPICS.SCENARIO_MODEL
      ) {
        return (data: {
          data: { box_array: TargetUpdateData };
          topic: TOPIC_TYPE;
        }) => {
          this.update(data.data.box_array);
        };
      }
      if (topic === ALL_TOPICS.DECISION_DEBUG_INFO) {
        return (data: {
          data: { box_array: TargetUpdateData } | { type: "text" };
          topic: TOPIC_TYPE;
        }) => {
          if ("box_array" in data.data) {
            this.update(data.data.box_array);
          }
        };
      }
      return (data: {
        data: { box_target_array: TargetUpdateData };
        topic: TOPIC_TYPE;
      }) => {
        this.update(data.data.box_target_array);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
