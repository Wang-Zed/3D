import {
  ATTRIBUTE_MAP,
  ProtobufElementSchema
} from "./protobuffer/protobuf_parser";

export function formatMsg(msg: string | ArrayBuffer | null) {
  if (typeof msg === "string") {
    const data = JSON.parse(msg);
    if (data.value?.value0?.data) {
      return {
        topic: data.topic,
        data: data.value.value0.data
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
      const data = element[ATTRIBUTE_MAP[type]].data;
      return {
        topic: element.topic,
        data
      };
    } catch (error) {
      // console.error("protobuf数据处理错误:", error);
    }
  } else {
    console.log("unknown data", msg);
  }
}
