const backgroundImages = [
  "AIR.jpg",
  "中世纪-骑士.jpeg",
  "钢铁侠.jpg",
  "你的名字.jpg",
  "守望先锋.jpg",
  "星球大战.jpg",
  "福特野马.jpg",
  "速度生活.jpg",
  "守望先锋.png",
  "冰与火之歌.png",
  "疯狂动物城.png",
  "塞尔达荒野之息.jpg",
];

const backgroundBaseUrl = "https://upyun.dogeow.com/wallpaper";
const doings = [];
const friendLinks = [];

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 17) return "下午好";
  if (hour < 18) return "傍晚好";
  return "晚上好";
}

function setGreeting() {
  const greetingNode = document.querySelector("#greeting");
  if (greetingNode) greetingNode.textContent = getGreeting();
}

function setBackground() {
  const name = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  const url = `${backgroundBaseUrl}/${name}!/fw/1920`;
  document.documentElement.style.setProperty(
    "--page-background",
    `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url("${url}")`
  );

  const info = document.querySelector("#wallpaper-info");
  if (info) {
    const displayName = name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, "");
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(displayName)}`;
    info.hidden = false;
    info.innerHTML = `
      <a class="wallpaper-button" href="${searchUrl}" target="_blank" rel="noopener noreferrer">
        <span class="wallpaper-button__label">${displayName}</span>
        <span class="wallpaper-button__icon" aria-hidden="true">🔍</span>
      </a>
    `;
  }
}

function startDoingTicker() {
  if (!doings.length) return;

  const doingNode = document.querySelector("#doing");
  if (!doingNode) return;

  const render = () => {
    const timestampSeconds = Math.floor(Date.now() / 1000);
    const maxDotCount = 4;
    const maxIndex = doings.length * maxDotCount - 1;
    const doingAndDotIndex = timestampSeconds % (maxIndex + 1);
    const doingIndex = Math.floor(doingAndDotIndex / maxDotCount);
    const dotCount = doingAndDotIndex % maxDotCount;
    doingNode.hidden = false;
    doingNode.innerHTML = `<a href="https://lab.dogeow.com/project/1" rel="noopener noreferrer">正在${doings[doingIndex]}.${".".repeat(dotCount)}</a>`;
  };

  render();
  window.setInterval(render, 1000);
}

function renderFriendLinks() {
  if (!friendLinks.length) return;

  const node = document.querySelector("#friend-links");
  if (!node) return;

  node.hidden = false;
  node.innerHTML = [
    "<span>友情链接：</span>",
    ...friendLinks.map(
      (link) =>
        `<a href="${link.url}" rel="noopener noreferrer" referrerpolicy="no-referrer">${link.title}</a>`
    ),
  ].join("");
}

setGreeting();
setBackground();
startDoingTicker();
renderFriendLinks();

window.setInterval(setGreeting, 60000);
