import type { Scene } from "three";

import { ALL_TOPICS, type VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Polyline, type PolylineUpdateData } from "../common";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.polyline)[number];

export default class PolylineRender extends Polyline {
  topic: TOPIC_TYPE;
  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    const createUpdateHanlder = () => {
      if (
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_CENTER_CAMERA_FOV120 ||
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_CENTER_CAMERA_FOV30 ||
        topic === ALL_TOPICS.PERCEPTION_CAMERA_ROADLINES_NV_CAMERAS ||
        topic === ALL_TOPICS.CENTER_CAMERA_FOV120_ROAD ||
        topic === ALL_TOPICS.CENTER_CAMERA_FOV30_ROAD
      ) {
        return (data: {
          data: { polyline: PolylineUpdateData };
          topic: TOPIC_TYPE;
        }) => {
          this.update(data.data.polyline);
        };
      }
      if (
        topic === ALL_TOPICS.DPC_PLANNING_DEBUG_INFO ||
        topic === ALL_TOPICS.SCENARIO_MODEL_DEBUG ||
        topic === ALL_TOPICS.PLANNING_INFO ||
        topic === ALL_TOPICS.SCENARIO_MODEL
      ) {
        return (data: {
          data: { polyline_array: PolylineUpdateData };
          topic: TOPIC_TYPE;
        }) => {
          this.update(data.data.polyline_array);
        };
      }
      if (topic === ALL_TOPICS.DECISION_DEBUG_INFO) {
        return (data: {
          data: { polyline_array: PolylineUpdateData } | { type: "text" };
          topic: TOPIC_TYPE;
        }) => {
          if ("polyline_array" in data.data) {
            this.update(data.data.polyline_array);
          }
        };
      }
      if (topic === ALL_TOPICS.PREDICTION_OBJECT) {
        return (data: {
          data: {
            polyline_array: PolylineUpdateData;
            history_polyline_array: PolylineUpdateData;
          };
          topic: TOPIC_TYPE;
        }) => {
          const mergeData = {
            ...data.data.polyline_array,
            data: data.data.polyline_array.data.concat(
              data.data.history_polyline_array.data
            )
          };
          this.update(mergeData);
        };
      }
      return (data: { data: PolylineUpdateData; topic: TOPIC_TYPE }) => {
        this.update(data.data);
      };
    };
    const updateHandler = createUpdateHanlder();
    VIEW_WS.on(topic, updateHandler);
  }
}
