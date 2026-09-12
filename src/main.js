import { config } from "./config.js";
import { createWallpaperController } from "./background.js";
import { getBackgroundRequestSize, getGreeting } from "./utils.js";

function setupWallpaper() {
  if (!config.backgroundImages.length) return;

  const controls = document.querySelector("#wallpaper-controls");
  const button = document.querySelector("#change-wallpaper");
  const info = document.querySelector("#wallpaper-info");
  const label = document.querySelector("#wallpaper-name");
  const status = document.querySelector("#wallpaper-status");
  const layers = [...document.querySelectorAll(".wallpaper__layer")];
  let activeLayer = 0;
  let resizeTimer;

  const wallpaper = createWallpaperController({
    names: config.backgroundImages,
    getUrl(name) {
      const size = getBackgroundRequestSize(
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio || 1,
      );
      return `${config.backgroundBaseUrl}/${encodeURIComponent(name)}!/max/${size}`;
    },
    onCommit({ name, url }) {
      const nextLayer = 1 - activeLayer;
      layers[nextLayer].style.backgroundImage = `url("${url}")`;
      layers[nextLayer].classList.add("is-visible");
      layers[activeLayer].classList.remove("is-visible");
      activeLayer = nextLayer;

      const displayName = name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, "");
      label.textContent = displayName;
      info.href = `https://www.bing.com/search?q=${encodeURIComponent(displayName)}`;
      info.setAttribute(
        "aria-label",
        `搜索壁纸：${displayName}（在新标签页打开）`,
      );
      info.title = `搜索壁纸：${displayName}`;
      info.hidden = false;
    },
    onStateChange({ loading, error }) {
      controls.setAttribute("aria-busy", String(loading));
      // aria-disabled blocks repeat actions without dropping keyboard focus.
      button.setAttribute("aria-disabled", String(loading));
      status.textContent = loading ? "正在加载壁纸…" : error;
    },
  });

  controls.hidden = false;
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-disabled") === "true") return;
    void wallpaper.change();
  });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => void wallpaper.resize(), 200);
  });
  void wallpaper.change();
}

function setupProjectIcons() {
  for (const image of document.querySelectorAll(".project-icon img")) {
    const showFallback = () => {
      image.hidden = true;
      image.parentElement.classList.add("has-error");
    };
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  }
}

function setupClock() {
  const greeting = document.querySelector("#greeting");
  const doing = document.querySelector("#doing");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  let doingText;
  let dots;

  if (config.doings.length) {
    // Keep the link mounted so the ticker never steals keyboard focus.
    const content = document.createElement(config.doingLink ? "a" : "span");
    if (config.doingLink) {
      content.href = config.doingLink;
      content.rel = "noopener noreferrer";
      content.target = "_blank";
    }
    doingText = document.createElement("span");
    dots = document.createElement("span");
    dots.className = "doing__dots";
    dots.setAttribute("aria-hidden", "true");
    content.append(doingText, dots);
    doing.append(content);
    doing.hidden = false;
  }

  function render() {
    greeting.textContent = getGreeting();
    if (!doingText) return;
    const seconds = Math.floor(Date.now() / 1000);
    const index = reducedMotion.matches
      ? 0
      : Math.floor(seconds / 4) % config.doings.length;
    const text = `正在${config.doings[index]}`;
    if (doingText.textContent !== text) doingText.textContent = text;
    dots.textContent = reducedMotion.matches
      ? "…"
      : ".".repeat((seconds % 4) + 1);
  }

  function sync() {
    window.clearInterval(timer);
    if (document.hidden) return;
    render();
    timer = window.setInterval(
      render,
      doingText && !reducedMotion.matches ? 1000 : 60000,
    );
  }

  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
}

function renderFriendLinks() {
  if (!config.friendLinks.length) return;
  const node = document.querySelector("#friend-links");
  const prefix = document.createElement("span");
  prefix.textContent = "友情链接";
  node.append(prefix);
  for (const link of config.friendLinks) {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.rel = "noopener noreferrer";
    anchor.referrerPolicy = "no-referrer";
    anchor.target = "_blank";
    anchor.textContent = link.title;
    node.append(anchor);
  }
  node.hidden = false;
}

setupClock();
setupProjectIcons();
setupWallpaper();
renderFriendLinks();
