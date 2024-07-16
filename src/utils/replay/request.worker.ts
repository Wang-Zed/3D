import pLimit from "p-limit";

import type { MaybeArray, RequestWorker } from "@/typings";

import { transform_MS } from "..";
import {
  readFileAsText,
  readFileBothRowByText,
  readFileFirstRowByFile,
  readFileFirstRowByText,
  readFileLastRowByFile,
  readFileLastRowByText
} from "../file";

interface HMIFileType {
  modifyTime: string;
  name: string;
  path: string;
  preSigned: string;
  size: string;
  type: string;
  urlHMI: string;
}

interface HMIResponseType {
  code: number;
  data: HMIFileType[];
  message: string;
}

const limit = pLimit(10);

const requestFiles = async (url: string, params?: Record<string, any>) => {
  const urlStr = new URL(url, location.origin);
  for (const key in params) {
    urlStr.searchParams.append(key, params[key]);
  }
  const res = await fetch(urlStr.toString()).then<HMIResponseType>((response) =>
    response.json()
  );
  return res.data;
};

const requestHMIFile = async (hmi_file: HMIFileType) => {
  const res = await fetch(hmi_file.preSigned).then((response) =>
    response.text()
  );
  return res;
};

const getDuration = async (
  firstFile: File | string,
  lastFile: File | string
) => {
  let startRow = "",
    endRow = "";
  if (typeof firstFile === "string") {
    startRow = readFileFirstRowByText(firstFile);
  } else {
    startRow = await readFileFirstRowByFile(firstFile);
  }
  if (typeof lastFile === "string") {
    endRow = readFileLastRowByText(lastFile);
  } else {
    endRow = await readFileLastRowByFile(lastFile);
  }

  const startColonIndex = startRow.indexOf(":");
  const endColonIndex = endRow.indexOf(":");
  if (startColonIndex === -1 || endColonIndex === -1) return;

  const startTime = transform_MS(+startRow.slice(0, startColonIndex));
  const endTime = transform_MS(+endRow.slice(0, endColonIndex));

  return { startTime, endTime };
};

const processFiles = async <T extends HMIFileType | File>(
  files: T[],
  readFunc: (file: T) => Promise<string>
) => {
  const totalLength = files.length;
  if (totalLength > 1) {
    const firstFile = files.shift()!;
    const lastFile = files.pop()!;
    const [firstResult, lastResult] = await Promise.all([
      readFunc(firstFile),
      readFunc(lastFile)
    ]);
    const duration = await getDuration(firstResult, lastResult);
    if (!duration) return;
    const { startTime, endTime } = duration;

    postMsg([
      {
        type: "durationchange",
        data: {
          startTime,
          endTime
        }
      },
      {
        type: "response",
        data: {
          text: firstResult,
          current: 1,
          total: totalLength
        }
      }
    ]);

    const queue = Array(totalLength - 2).fill(null);
    let processIndex = 0;

    await Promise.all(
      files.map((file, i) =>
        limit(async () => {
          const res = await readFunc(file);
          queue[i] = res;
          while (queue[processIndex]) {
            postMsg({
              type: "response",
              data: {
                text: queue[processIndex],
                current: processIndex + 2,
                total: totalLength
              }
            });
            processIndex++;
          }
        })
      )
    );

    postMsg([
      {
        type: "response",
        data: {
          text: lastResult,
          current: totalLength,
          total: totalLength
        }
      },
      {
        type: "finish"
      }
    ]);
  } else if (totalLength === 1) {
    const text = await readFunc(files[0]);
    const { firstRow, lastRow } = readFileBothRowByText(text);
    const duration = await getDuration(firstRow, lastRow);
    if (!duration) return;
    const { startTime, endTime } = duration;

    postMsg([
      {
        type: "durationchange",
        data: {
          startTime,
          endTime
        }
      },
      {
        type: "response",
        data: {
          text,
          current: 1,
          total: 1
        }
      },
      {
        type: "finish"
      }
    ]);
  }
};

const postMsg = (msg: MaybeArray<RequestWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

onmessage = async (ev: MessageEvent<RequestWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "request") {
    const { url, params } = data;
    const hmi_files = await requestFiles(url, params);
    await processFiles(hmi_files, requestHMIFile);
  } else if (type === "files") {
    data.sort((a, b) =>
      a.name.localeCompare(b.name, "zh-CN", { numeric: true })
    );
    await processFiles(data, readFileAsText);
  }
};
