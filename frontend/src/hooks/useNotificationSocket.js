import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useNotifications } from "../context/NotificationContext";
import { showBrowserNotification } from "../utils/browserNotifications";
function useNotificationSocket() {
  const { addNotification } = useNotifications();
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe("/topic/notifications", (frame) => {
          try {
            const notification = JSON.parse(frame.body);
            if (!notification.title || !notification.message) {
              return;
            }
            const type = [
              "success",
              "warning",
              "reminder",
              "info",
            ].includes(notification.type)
              ? notification.type
              : "info";
            addNotification(
              notification.title,
              notification.message,
              type
            );
            showBrowserNotification(
              notification.title,
              notification.message
            );
          } catch (error) {
            console.error("Unable to process notification:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket broker error:", frame.headers.message);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket connection error:", error);
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [addNotification]);
}
export default useNotificationSocket;
