// 判断是否为手机端
export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone');
}