import {createContext,useCallback,useContext,useMemo,useState,} from "react";
import NotificationToast from "../components/NotificationToast/NotificationToast";
import "./NotificationContext.css";
const NotificationContext = createContext(null);
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const addNotification = useCallback((title, message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const item = {
      id,
      title,
      message,
      type,
      time,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((current) => [item, ...current]);
    setToasts((current) => [...current, item]);
    return id;
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);
  const markAsRead = useCallback((id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }, []);
  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, []);
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    ]
  );
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="global-toast-container">
        {toasts.map((item) => (
          <NotificationToast
            key={item.id}
            notification={item}
            onDismiss={dismissToast}
            duration={6000}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }
  return context;
}
