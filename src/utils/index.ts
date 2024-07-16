import type { TopicEvent } from "@/typings";

import {
  ATTRIBUTE_MAP,
  ProtobufElementSchema
} from "./protobuffer/protobuf_parser";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export function formatTime(ms: number): string {
  if (typeof ms !== "number" || Number.isNaN(ms) || ms <= 0) {
    return "00:00";
  }
  const hour = Math.floor(ms / HOUR);
  ms = ms % HOUR;
  const minute = Math.floor(ms / MINUTE);
  ms = ms % MINUTE;
  const second = Math.floor(ms / SECOND);
  if (hour) {
    return `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
  }
  return `${padZero(minute)}:${padZero(second)}`;
}

function padZero(num: number, len = 2): string {
  let str = String(num);
  const threshold = Math.pow(10, len - 1);
  if (num < threshold) {
    while (String(threshold).length > str.length) {
      str = `0${num}`;
    }
  }
  return str;
}

export function formatBytes(bytes: number, fractionDigits = 2) {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < Math.pow(1024, 2)) {
    return (bytes / Math.pow(1024, 1)).toFixed(fractionDigits) + " KB";
  } else if (bytes < Math.pow(1024, 3)) {
    return (bytes / Math.pow(1024, 2)).toFixed(fractionDigits) + " MB";
  } else if (bytes < Math.pow(1024, 4)) {
    return (bytes / Math.pow(1024, 3)).toFixed(fractionDigits) + " GB";
  } else if (bytes < Math.pow(1024, 5)) {
    return (bytes / Math.pow(1024, 4)).toFixed(fractionDigits) + " TB";
  } else if (bytes < Math.pow(1024, 6)) {
    return (bytes / Math.pow(1024, 5)).toFixed(fractionDigits) + " PB";
  } else {
    return (bytes / Math.pow(1024, 6)).toFixed(fractionDigits) + " EB";
  }
}

export function binarySearch<T>(arr: T[], comparator: (item: T) => number) {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const cmp = comparator(arr[mid]);

    if (cmp < 0) {
      start = mid + 1;
    } else if (cmp > 0) {
      end = mid - 1;
    } else {
      // Found the target
      return mid;
    }
  }

  // Target not found, return the index where it should be inserted
  return start;
}

export function formatMsg(
  msg: string | ArrayBuffer | null
): Parameters<TopicEvent[keyof TopicEvent]>[number] | undefined {
  if (typeof msg === "string") {
    const data = JSON.parse(msg);
    if (data.value?.value0) {
      return {
        topic: data.topic,
        data: data.value.value0
      };
    } else if (data.elements) {
      const element = data.elements[0];
      const type = element.type as keyof typeof ATTRIBUTE_MAP;
      return {
        topic: element.topic,
        data: {
          data: element[ATTRIBUTE_MAP[type]].data,
          defaultEnable: element.defaultEnable,
          group: "others",
          style: {},
          timestamp_nsec: element.timestampNsec,
          topic: element.topic,
          type: type
        }
      };
    }
    return {
      topic: data.topic,
      data: data
    };
  } else if (msg instanceof ArrayBuffer) {
    try {
      const uint8Array = new Uint8Array(msg);
      const res = ProtobufElementSchema.decode(uint8Array) as any;
      const element = res.elements[0];
      const type = element.type as keyof typeof ATTRIBUTE_MAP;
      return {
        topic: element.topic,
        data: {
          data: element[ATTRIBUTE_MAP[type]].data,
          defaultEnable: element.defaultEnable,
          group: "others",
          style: {},
          timestamp_nsec: element.timestampNsec,
          topic: element.topic,
          type: type
        }
      };
    } catch (error) {
      // console.error("protobuf数据处理错误:", error);
    }
  } else {
    console.log("unknown data", msg);
  }
}

/**
 * 转换时间戳为毫秒时间戳
 * @param timestamp 整数时间戳
 * @returns 毫秒时间戳
 */
export function transform_MS(timestamp: number) {
  const timeLength = timestamp.toFixed().length;
  const lengthDiff = timeLength - 13;
  return timestamp / Math.pow(10, lengthDiff);
}
