import protobuf from "protobufjs";

import ProtobufSchema from "./protobuf_schema.json";

const ElementStr = "senseAD.senseview.Element";

const root = protobuf.Root.fromJSON(ProtobufSchema);
const ProtobufElementSchema = root.lookupType(ElementStr);

const ATTRIBUTE_MAP = {
  text: ".senseAD.senseview.textElement",
  // image: ".senseAD.senseview.imageElement",
  image: ".senseAD.senseview.imageElementsWithMarks",
  image_proto: ".senseAD.senseview.imageElementsWithMarks",
  vehicle_info: ".senseAD.senseview.vehicleInfoElement",
  traffic_light_group: ".senseAD.senseview.trafficLightGroupElement",
  console_log: "",
  vehicle_stat: "",
  status: ".senseAD.senseview.statusElement",
  system_status: "",
  polyline: ".senseAD.senseview.polylineElement",
  point: ".senseAD.senseview.pointElement",
  arrow: ".senseAD.senseview.arrowElement",
  sphere: "",
  polygon: ".senseAD.senseview.polygonElement",
  cylinder: "",
  ellipse: "",
  mesh: "",
  freespace: ".senseAD.senseview.freespaceElement",
  text_sprite: ".senseAD.senseview.textSpriteElement",
  car_pose: "",
  target: ".senseAD.senseview.boxElement"
};

export { ATTRIBUTE_MAP, ProtobufElementSchema };
