import log from "./log";

export const versionShow = () => {
  log.primary(`Build Time:  ${__BUILDTIME__}`);
  log.primary(`Last Commit: ${__COMMITID__}`);
};
