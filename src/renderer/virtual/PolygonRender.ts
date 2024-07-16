import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Polygon, type PolygonUpdateData } from "../common";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.polygon)[number];

export default class PolygonRender extends Polygon {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (topic === ALL_TOPICS.LIDAR_FOV_ZONES) {
        return (data: { data: PolygonUpdateData; topic: TOPIC_TYPE }) => {
          this.update(data.data);
        };
      }
      if (topic === ALL_TOPICS.PREDICTION_OBJECT) {
        return (data: {
          data: { polygon: PolygonUpdateData };
          topic: TOPIC_TYPE;
        }) => {
          this.update(data.data.polygon);
        };
      }
      return (data: {
        data: { polygon_array: PolygonUpdateData };
        topic: TOPIC_TYPE;
      }) => {
        this.update(data.data.polygon_array);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
