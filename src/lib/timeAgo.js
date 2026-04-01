export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}周前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(days / 365)}年前`;
}
