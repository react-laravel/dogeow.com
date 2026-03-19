import { config } from "./config.js";
import { getGreeting } from "./utils.js";

function setGreeting() {
  const greetingNode = document.querySelector("#greeting");
  if (greetingNode) greetingNode.textContent = getGreeting();
}

function setBackground() {
  const name =
    config.backgroundImages[
      Math.floor(Math.random() * config.backgroundImages.length)
    ];
  const url = `${config.backgroundBaseUrl}/${name}!/fw/1920`;

  const img = new Image();
  img.src = url;
  img.onload = () => {
    document.documentElement.style.setProperty(
      "--page-background",
      `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url("${url}")`,
    );
    document.body.classList.add("bg-loaded");
  };

  const info = document.querySelector("#wallpaper-info");
  if (info) {
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
startDoingTicker();
renderFriendLinks();

window.setInterval(setGreeting, 60000);
