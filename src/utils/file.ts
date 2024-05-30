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

export async function readFileFirstRow(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  const view = new Uint8Array(buffer);
  const rowIndex = view.indexOf(0x0a);
  const rowBuffer = view.slice(0, rowIndex);
  return new TextDecoder().decode(rowBuffer);
}

export async function readFileLastRow(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  const view = new Uint8Array(buffer);
  let rowIndex = view.lastIndexOf(0x0a);
  if (rowIndex !== -1 && rowIndex === view.byteLength - 1) {
    rowIndex = view.lastIndexOf(0x0a, rowIndex - 1);
  }
  const rowBuffer = view.slice(rowIndex + 1);
  return new TextDecoder().decode(rowBuffer);
}

export async function readFileBothRow(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  const view = new Uint8Array(buffer);
  const firstRowIndex = view.indexOf(0x0a);
  const firstRowBuffer = view.slice(0, firstRowIndex);
  let lastRowIndex = view.lastIndexOf(0x0a);
  if (lastRowIndex !== -1 && lastRowIndex === view.byteLength - 1) {
    lastRowIndex = view.lastIndexOf(0x0a, lastRowIndex - 1);
  }
  const lastRowBuffer = view.slice(lastRowIndex + 1);
  return {
    firstRow: new TextDecoder().decode(firstRowBuffer),
    lastRow: new TextDecoder().decode(lastRowBuffer)
  };
}
