export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 0 && hour < 5) {
    return "夜深了";
  }
  if (hour >= 5 && hour < 9) {
    return "早上好";
  }
  if (hour >= 9 && hour < 14) {
    return "中午好";
  }
  if (hour >= 14 && hour < 18) {
    return "傍晚好";
  }
  return "晚上好";
};
