export function chooseFile(options?: {
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  onchange?: (ev: Event) => void;
}) {
  return new Promise<HTMLInputElement["files"]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.onchange = (ev) => {
      const ele = ev.target as HTMLInputElement;
      resolve(ele.files);
    };
    if (options) {
      let key: keyof typeof options;
      for (key in options) {
        if (key === "directory" && options[key]) {
          input.webkitdirectory = true;
        } else {
          // @ts-ignore
          input[key] = options[key];
        }
      }
    }
    document.body.appendChild(input);
    input.dispatchEvent(new MouseEvent("click"));
    input.remove();
  });
}

export function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as Text"));
      }
    };
    reader.onerror = (event) => {
      reject(event.target?.error || "Failed to read file");
    };
    reader.readAsText(file);
  });
}

export function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = (event) => {
      reject(event.target?.error || "Failed to read file");
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function readFileFirstRowByFile(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  const view = new Uint8Array(buffer);
  let startIndex = 0;
  let rowIndex = view.indexOf(0x0a);

  while (rowIndex !== -1) {
    const rowBuffer = view.slice(startIndex, rowIndex);
    const row = new TextDecoder().decode(rowBuffer).trim();
    if (row) {
      return row;
    }
    startIndex = rowIndex + 1;
    rowIndex = view.indexOf(0x0a, startIndex);
  }

  // 如果没有找到非空行，返回整个文本
  const lastRow = new TextDecoder().decode(view).trim();
  return lastRow;
}

export async function readFileLastRowByFile(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  const view = new Uint8Array(buffer);
  let endIndex = view.byteLength;
  let rowIndex = view.lastIndexOf(0x0a);

  while (rowIndex !== -1) {
    const rowBuffer = view.slice(rowIndex + 1, endIndex);
    const row = new TextDecoder().decode(rowBuffer).trim();
    if (row) {
      return row;
    }
    endIndex = rowIndex;
    rowIndex = view.lastIndexOf(0x0a, rowIndex - 1);
  }

  // 如果没有找到非空行，返回整个文本
  const firstRow = new TextDecoder().decode(view).trim();
  return firstRow;
}

export async function readFileBothRowByFile(file: File) {
  const firstRow = await readFileFirstRowByFile(file);
  const lastRow = await readFileLastRowByFile(file);

  return {
    firstRow: firstRow,
    lastRow: lastRow
  };
}

export function readFileFirstRowByText(text: string) {
  let firstRowIndex = text.indexOf("\n");
  let startIndex = 0;

  while (firstRowIndex !== -1) {
    const firstRow = text.slice(startIndex, firstRowIndex).trim();
    if (firstRow) {
      return firstRow;
    }
    startIndex = firstRowIndex + 1;
    firstRowIndex = text.indexOf("\n", startIndex);
  }

  // 如果没有找到非空行，返回整个文本（可能是单行文本）
  return text.trim();
}

export function readFileLastRowByText(text: string) {
  let lastRowIndex = text.lastIndexOf("\n");
  let endIndex = text.length;

  while (lastRowIndex !== -1) {
    const lastRow = text.slice(lastRowIndex + 1, endIndex).trim();
    if (lastRow) {
      return lastRow;
    }
    endIndex = lastRowIndex;
    lastRowIndex = text.lastIndexOf("\n", lastRowIndex - 1);
  }

  // 如果没有找到非空行，返回整个文本（可能是单行文本）
  return text.trim();
}

export function readFileBothRowByText(text: string) {
  const firstRow = readFileFirstRowByText(text);
  const lastRow = readFileLastRowByText(text);

  return {
    firstRow: firstRow,
    lastRow: lastRow
  };
}
