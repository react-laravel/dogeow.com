// 工具函数

const greetingRanges = [
  { until: 5, text: "夜深了" },
  { until: 9, text: "早上好" },
  { until: 11, text: "上午好" },
  { until: 13, text: "中午好" },
  { until: 17, text: "下午好" },
  { until: 18, text: "傍晚好" },
  { until: 23, text: "晚上好" },
  { until: 24, text: "夜深了" },
];

export function getGreeting(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("getGreeting requires a valid Date object");
  }

  const hour = date.getHours();
  return greetingRanges.find((range) => hour < range.until).text;
}

export function getBackgroundRequestSize(width, height, devicePixelRatio = 1) {
  const targetSize = Math.max(width, height) * Math.min(devicePixelRatio, 2);
  return Math.min(2560, Math.max(960, Math.ceil(targetSize / 160) * 160));
}

export function pickBackground(names, currentName = "", random = Math.random) {
  const candidates = names.filter((name) => name !== currentName);
  if (!candidates.length) return names[0] || "";
  return candidates[Math.floor(random() * candidates.length)];
}
