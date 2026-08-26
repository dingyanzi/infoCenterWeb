// 判断是否为手机端
export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone');
}
//前缀补零
export function prefixZero(num, n) {
  return (Array(n).join(0) + num).slice(-n)
}

// 将 UTC 时间转换为本地时间字符串格式 YYYY-MM-DD HH:mm:ss
export function formatUTCDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = prefixZero(d.getMonth() + 1, 2);
  const day = prefixZero(d.getDate(), 2);
  const hours = prefixZero(d.getHours(), 2);
  const minutes = prefixZero(d.getMinutes(), 2);
  const seconds = prefixZero(d.getSeconds(), 2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化数组为字符串
export function formatArray(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : '';
}

// 格式化日期为字符串格式 YYYY-MM-DD
export function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = prefixZero(d.getMonth() + 1, 2);
  const day = prefixZero(d.getDate(), 2);
  return `${year}-${month}-${day}`;
}

// 格式化日期为字符串格式 YYYYMMDDHHmmss
export function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = prefixZero(d.getMonth() + 1, 2);
  const day = prefixZero(d.getDate(), 2);
  const hours = prefixZero(d.getHours(), 2);
  const minutes = prefixZero(d.getMinutes(), 2);
  const seconds = prefixZero(d.getSeconds(), 2);
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

