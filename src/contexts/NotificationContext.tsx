import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  AppNotification,
  generateEventNotifications,
  requestNotificationPermission,
  sendBrowserNotification,
} from "@/lib/notifications";
import { mockEvents } from "@/data/mockEvents";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  enablePush: () => Promise<boolean>;
  pushEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Fallback for HMR/edge cases — return safe defaults
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
      enablePush: async () => false,
      pushEnabled: false,
    } as NotificationContextType;
  }
  return ctx;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Generate initial notifications from mock data
  useEffect(() => {
    const generated = generateEventNotifications(mockEvents);
    setNotifications(generated);

    // Check existing permission
    if ("Notification" in window && Notification.permission === "granted") {
      setPushEnabled(true);
    }
  }, []);

  // Simulate a new notification arriving after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotif: AppNotification = {
        id: `live-${Date.now()}`,
        type: "trending",
        title: "🔥 Just Now",
        body: "SUBTERRANEAN just hit 95% sold — grab your ticket!",
        emoji: "🔥",
        eventId: "3",
        eventTitle: "SUBTERRANEAN",
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (pushEnabled) {
        sendBrowserNotification(newNotif);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [pushEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const enablePush = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPushEnabled(granted);
    return granted;
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll, enablePush, pushEnabled }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
