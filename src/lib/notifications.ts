import { EventData } from "@/data/mockEvents";
import { calculatePopularity } from "@/lib/popularity";

export type NotificationType = "trending" | "almost_sold_out" | "friends_attending" | "starting_soon";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  eventId: string;
  eventTitle: string;
  timestamp: Date;
  read: boolean;
}

const notificationMeta: Record<NotificationType, { emoji: string; color: string }> = {
  trending: { emoji: "🔥", color: "hsl(267, 100%, 50%)" },
  almost_sold_out: { emoji: "🎟️", color: "hsl(346, 100%, 59%)" },
  friends_attending: { emoji: "👯", color: "hsl(140, 100%, 50%)" },
  starting_soon: { emoji: "⏰", color: "hsl(40, 100%, 50%)" },
};

export const getNotificationMeta = (type: NotificationType) => notificationMeta[type];

/**
 * Request browser notification permission.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

/**
 * Send a browser push notification (if permitted).
 */
export const sendBrowserNotification = (notification: AppNotification) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const { emoji, color } = getNotificationMeta(notification.type);
  new Notification(`${emoji} ${notification.title}`, {
    body: notification.body,
    icon: "/favicon.ico",
    tag: notification.id,
    data: { eventId: notification.eventId },
  });
};

/**
 * Generate notifications for a set of events based on popularity signals.
 */
export const generateEventNotifications = (events: EventData[]): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const now = new Date();

  events.forEach((event) => {
    const signals = calculatePopularity(event);

    // Almost Sold Out
    if (signals.soldPercent >= 85) {
      notifications.push({
        id: `aso-${event.id}`,
        type: "almost_sold_out",
        title: "Almost Sold Out!",
        body: `${event.title} is ${signals.soldPercent}% sold — only ${event.capacity - event.ticketsSold} tickets left!`,
        emoji: "🎟️",
        eventId: event.id,
        eventTitle: event.title,
        timestamp: new Date(now.getTime() - Math.random() * 3600000),
        read: false,
      });
    }

    // Trending
    if (signals.totalScore >= 60) {
      notifications.push({
        id: `trend-${event.id}`,
        type: "trending",
        title: "Trending Now",
        body: `${event.title} is blowing up — ${event.going} people going!`,
        emoji: "🔥",
        eventId: event.id,
        eventTitle: event.title,
        timestamp: new Date(now.getTime() - Math.random() * 7200000),
        read: false,
      });
    }

    // Friends Attending
    if (event.friendsGoing.length >= 2) {
      const names = event.friendsGoing.slice(0, 2).join(" & ");
      const extra = event.friendsGoing.length > 2 ? ` +${event.friendsGoing.length - 2} more` : "";
      notifications.push({
        id: `friends-${event.id}`,
        type: "friends_attending",
        title: "Friends Going!",
        body: `${names}${extra} are going to ${event.title}`,
        emoji: "👯",
        eventId: event.id,
        eventTitle: event.title,
        timestamp: new Date(now.getTime() - Math.random() * 5400000),
        read: false,
      });
    }

    // Starting Soon (mock — events "today")
    if (event.date.includes("Thu") || event.date.includes("Fri")) {
      notifications.push({
        id: `soon-${event.id}`,
        type: "starting_soon",
        title: "Starting Soon!",
        body: `${event.title} starts at ${event.time} — don't forget your ticket!`,
        emoji: "⏰",
        eventId: event.id,
        eventTitle: event.title,
        timestamp: new Date(now.getTime() - Math.random() * 1800000),
        read: false,
      });
    }
  });

  // Sort newest first
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
