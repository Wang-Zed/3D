import dayjs from "dayjs";

export default () => {
  const buildTime = dayjs().format("YYYY-M-D HH:mm:ss");
  const buildGitCommitId = __COMMITID__;

  const gapChar = " ";

  // window.console?.clear()
  window.console?.log(
    [
      `%c
\u23F0${gapChar.repeat(2)}${buildTime}\
${gapChar.repeat(6)}\
\u26CF${gapChar.repeat(2)}${buildGitCommitId}
`
    ].join(""),
    `color: #999; font-family: "Roboto";`
  );
};
