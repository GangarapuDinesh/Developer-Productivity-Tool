import { useEffect } from "react";
import { FiBell,FiCheckCircle,FiAlertCircle,FiClock,FiX,} from "react-icons/fi";
import "./NotificationToast.css";
const iconMap = {success: FiCheckCircle,warning: FiAlertCircle,reminder: FiClock,info: FiBell,};
function NotificationToast({
  notification,
  onDismiss,
  duration = 6000,
}) {
  useEffect(() => {
    if (!notification || duration <= 0) return undefined;
    const timer = window.setTimeout(() => {
      onDismiss(notification.id);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [notification, onDismiss, duration]);
  if (!notification) return null;
  const Icon = iconMap[notification.type] || FiBell;
  return (
    <article
      className={`notification-toast notification-toast-${
        notification.type || "info"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="notification-toast-icon">
        <Icon />
      </div>
      <div className="notification-toast-content">
       <strong>
          {notification.title || "DevFlow notification"}
        </strong>
        <p>{notification.message || "You have a new notification."}</p>
        {notification.time && (
          <span className="notification-toast-time">
            {notification.time}
          </span>
        )}
      </div>
      <button
        type="button"
        className="notification-toast-close"
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss notification"
      >
        <FiX />
      </button>
    </article>
  );
}
export default NotificationToast;
