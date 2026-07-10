import { config } from "./config.js";
import { getGreeting } from "./utils.js";

const BACKGROUND_MIN_SIZE = 960;
const BACKGROUND_MAX_SIZE = 2560;
const BACKGROUND_SIZE_STEP = 160;
const BACKGROUND_DPR_CAP = 2;

let currentBackgroundName = "";
let currentBackgroundUrl = "";
let backgroundResizeTimer = 0;

function roundUpToStep(value, step) {
  return Math.ceil(value / step) * step;
}

function getBackgroundRequestSize() {
  const viewportWidth = Math.max(
    window.innerWidth || 0,
    document.documentElement.clientWidth || 0,
  );
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  );
  const devicePixelRatio = Math.min(
    window.devicePixelRatio || 1,
    BACKGROUND_DPR_CAP,
  );
  const longestEdge = Math.max(viewportWidth, viewportHeight);
  const targetSize = longestEdge * devicePixelRatio;

  return Math.min(
    BACKGROUND_MAX_SIZE,
    Math.max(
      BACKGROUND_MIN_SIZE,
      roundUpToStep(targetSize, BACKGROUND_SIZE_STEP),
    ),
  );
}

function getBackgroundUrl(name) {
  return `${config.backgroundBaseUrl}/${name}!/max/${getBackgroundRequestSize()}`;
}

function renderWallpaperInfo(name) {
  const info = document.querySelector("#wallpaper-info");
  if (!info) return;

  const displayName = name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, "");
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(
    displayName,
  )}`;

  info.hidden = false;
  info.innerHTML = "";

  const link = document.createElement("a");
  link.className = "wallpaper-button";
  link.href = searchUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const label = document.createElement("span");
  label.className = "wallpaper-button__label";
  label.textContent = displayName;

  const icon = document.createElement("span");
  icon.className = "wallpaper-button__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

  link.append(label, icon);
  info.append(link);
}

function setGreeting() {
  const greetingNode = document.querySelector("#greeting");
  if (greetingNode) greetingNode.textContent = getGreeting();
}

function setBackground(name = "") {
  const nextBackgroundName =
    name ||
    config.backgroundImages[
      Math.floor(Math.random() * config.backgroundImages.length)
    ];
  const url = getBackgroundUrl(nextBackgroundName);

  currentBackgroundName = nextBackgroundName;
  renderWallpaperInfo(nextBackgroundName);

  if (url === currentBackgroundUrl) return;

  currentBackgroundUrl = url;

  const img = new Image();
  img.src = url;
  img.onload = () => {
    if (url !== currentBackgroundUrl) return;

    document.documentElement.style.setProperty(
      "--page-background",
      `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url("${url}")`,
    );
    document.body.classList.add("bg-loaded");
  };
}

function bindBackgroundResize() {
  window.addEventListener("resize", () => {
    if (!currentBackgroundName) return;

    window.clearTimeout(backgroundResizeTimer);
    backgroundResizeTimer = window.setTimeout(() => {
      setBackground(currentBackgroundName);
    }, 150);
  });
}

function startDoingTicker() {
  if (!config.doings.length) return;

  const doingNode = document.querySelector("#doing");
  if (!doingNode) return;

  const render = () => {
    const timestampSeconds = Math.floor(Date.now() / 1000);
    const maxDotCount = 4;
    const maxIndex = config.doings.length * maxDotCount - 1;
    const doingAndDotIndex = timestampSeconds % (maxIndex + 1);
    const doingIndex = Math.floor(doingAndDotIndex / maxDotCount);
    const dotCount = doingAndDotIndex % maxDotCount;
    doingNode.hidden = false;

    doingNode.innerHTML = "";
    const link = document.createElement("a");
    link.href = config.doingLink;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.textContent = `正在${config.doings[doingIndex]}${".".repeat(dotCount + 1)}`;
    doingNode.append(link);
  };

  render();
  window.setInterval(render, 1000);
}

function renderFriendLinks() {
  if (!config.friendLinks.length) return;

  const node = document.querySelector("#friend-links");
  if (!node) return;

  node.hidden = false;
  node.innerHTML = "";

  const prefix = document.createElement("span");
  prefix.textContent = "友情链接：";
  node.append(prefix);

  for (const link of config.friendLinks) {
    const a = document.createElement("a");
    a.href = link.url;
    a.rel = "noopener noreferrer";
    a.referrerPolicy = "no-referrer";
    a.target = "_blank";
    a.textContent = link.title;
    node.append(a);
  }
}

setGreeting();
setBackground();
bindBackgroundResize();
startDoingTicker();
renderFriendLinks();

window.setInterval(setGreeting, 60000);
