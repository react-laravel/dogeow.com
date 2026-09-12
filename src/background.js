import { pickBackground } from "./utils.js";

export function loadWallpaper(url, { signal, timeout = 12000 } = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let timer;

    const finish = (error) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener("abort", abort);
      if (error) {
        image.removeAttribute("src");
        reject(error);
      } else {
        resolve();
      }
    };
    const abort = () => finish(new Error("Wallpaper request cancelled"));

    if (signal?.aborted) {
      abort();
      return;
    }

    signal?.addEventListener("abort", abort, { once: true });
    image.onload = () => finish();
    image.onerror = () => finish(new Error("Wallpaper failed to load"));
    timer = setTimeout(
      () => finish(new Error("Wallpaper request timed out")),
      timeout,
    );
    image.src = url;
  });
}

// Commit the image and its label together; only the latest request may commit.
export function createWallpaperController({
  names,
  getUrl,
  onCommit,
  onStateChange,
  load = loadWallpaper,
  random = Math.random,
}) {
  let current = null;
  let pending = null;
  let requestId = 0;

  async function request(name) {
    if (!name) return false;

    const url = getUrl(name);
    if (pending?.url === url || (!pending && current?.url === url))
      return false;

    const id = ++requestId;
    pending?.abort.abort();
    const abort = new AbortController();
    pending = { name, url, abort };
    onStateChange({ loading: true, error: "" });

    try {
      await load(url, { signal: abort.signal });
      if (id !== requestId) return false;
      current = { name, url };
      pending = null;
      onCommit(current);
      onStateChange({ loading: false, error: "" });
      return true;
    } catch {
      if (id !== requestId) return false;
      pending = null;
      onStateChange({
        loading: false,
        error: current
          ? "壁纸加载失败，已保留当前背景。可以再试一次。"
          : "壁纸暂时无法加载，点击「换一张」重试。",
      });
      return false;
    }
  }

  return {
    change() {
      return request(
        pickBackground(names, pending?.name || current?.name, random),
      );
    },
    resize() {
      // A resize upgrades the pending wallpaper instead of restoring the old one.
      return request(pending?.name || current?.name);
    },
  };
}
