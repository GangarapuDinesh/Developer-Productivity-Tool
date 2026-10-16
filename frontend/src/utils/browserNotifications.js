export async function enableBrowserNotifications() {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  if (Notification.permission === "denied") {
    return "denied";
  }
  return await Notification.requestPermission();
}
export function showBrowserNotification(title, message) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body: message,
    icon: "/favicon.ico",
    tag: "devflow-notification",
  });
}
