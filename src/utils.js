// 工具函数

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 11) return "上午好";
  if (hour < 13) return "中午好";
  if (hour < 17) return "下午好";
  if (hour < 18) return "傍晚好";
  return "晚上好";  
}
