type ColorTypes =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "text"
  | "default";

/**
 * @description 返回这个样式的颜色值
 * @param {String} type 样式名称 [ primary | success | warning | danger | text ]
 */
const typeColor = (type: ColorTypes = "default") => {
  let color = "";
  switch (type) {
    case "default":
      color = "#35495E";
      break;
    case "primary":
      color = "#3488ff";
      break;
    case "success":
      color = "#43B883";
      break;
    case "warning":
      color = "#e6a23c";
      break;
    case "danger":
      color = "#f56c6c";
      break;
    default:
      break;
  }
  return color;
};

/**
 * @description 获取调用者的位置
 * @param {number} stackIndex 堆栈层级
 */
function getCallerLocation(stackIndex = 4) {
  const error = new Error();
  const stack = error.stack?.split("\n")[stackIndex]; // 获取指定堆栈层级的信息
  return stack?.trim() || "";
}

/**
 * @description 打印一个 [ title | text ] 样式的信息
 * @param {String} title title text
 * @param {String} info info text
 * @param {ColorTypes} type style
 */
function capsule(
  title: string = "",
  info: string = "",
  type: ColorTypes = "primary"
) {
  const location = getCallerLocation(4);
  console.log(
    `%c ${title} %c ${info} %c %c${location}`,
    "background:#35495E; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;",
    `background:${typeColor(
      type
    )}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff;`,
    "background:transparent",
    "color: #aaa; font-size: 0.8em;"
  );
}

/**
 * @description 打印彩色文字
 */
function colorful(textArr: { text?: string; type: ColorTypes }[]) {
  const location = getCallerLocation(4);
  console.log(
    `%c${textArr.map((t) => t.text || "").join("%c")}%c ${location}`,
    ...textArr.map((t) => `color: ${typeColor(t.type)};`),
    "color: #aaa; font-size: 0.8em;"
  );
}

const log = {
  /**
   * @description 打印 default 样式的文字
   */
  default(text: string, subText = "") {
    if (subText) {
      capsule(text, subText, "default");
    } else {
      colorful([{ text, type: "default" }]);
    }
  },

  /**
   * @description 打印 primary 样式的文字
   */
  primary(text: string, subText = "") {
    if (subText) {
      capsule(text, subText, "primary");
    } else {
      colorful([{ text, type: "primary" }]);
    }
  },

  /**
   * @description 打印 success 样式的文字
   */
  success(text: string, subText = "") {
    if (subText) {
      capsule(text, subText, "success");
    } else {
      colorful([{ text, type: "success" }]);
    }
  },

  /**
   * @description 打印 warning 样式的文字
   */
  warning(text: string, subText = "") {
    if (subText) {
      capsule(text, subText, "warning");
    } else {
      colorful([{ text, type: "warning" }]);
    }
  },

  /**
   * @description 打印 danger 样式的文字
   */
  danger(text: string, subText = "") {
    if (subText) {
      capsule(text, subText, "danger");
    } else {
      colorful([{ text, type: "danger" }]);
    }
  }
};

export default log;
