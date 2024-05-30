import dayjs from "dayjs";

import log from "./log";

export const versionShow = () => {
  const buildTime = dayjs().format("YYYY-M-D HH:mm:ss");

  log.primary(`Build Time:  ${buildTime}`);
  log.primary(`Last Commit: ${__COMMITID__}`);
};
