export function debounce(func: <T>(..._args: T[]) => void, delay = 0) {
  let timerId: number;
  return <T>(...args: T[]) => {
    clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      func(args);
    }, delay);
  };
}

export function throttle(func: <T>(..._args: T[]) => void, delay = 0) {
  let timerId: number;
  return <T>(...args: T[]) => {
    if (!timerId) {
      timerId = window.setTimeout(() => {
        func(args);
        timerId = 0;
      }, delay);
    }
  };
}

export function resizeListener(
  dom: HTMLElement,
  callback: <T>(...args: T[]) => void
) {
  const ob = new ResizeObserver(callback);
  ob.observe(dom);
  return ob;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export function formatTime(ms: number): string {
  if (ms <= 0) {
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
