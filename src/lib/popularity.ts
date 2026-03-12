import { EventData } from "@/data/mockEvents";

export interface PopularitySignals {
  soldPercent: number;
  goingScore: number;
  friendsScore: number;
  commentsScore: number;
  velocityScore: number;
  totalScore: number;
}

export interface PopularityBadge {
  label: string;
  emoji: string;
  type: "trending" | "almost_sold_out" | "friends_going" | "hot" | "new";
}

/**
 * Calculates a composite popularity score (0–100) from multiple signals.
 *
 * Weights:
 *  - Ticket sales velocity (sold% relative to capacity)  → 30%
 *  - Attendee count (going)                               → 25%
 *  - Friend attendance                                    → 25%
 *  - Comment activity                                     → 20%
 */
export const calculatePopularity = (event: EventData): PopularitySignals => {
  // 1. Sold % — direct measure of demand
  const soldPercent = Math.round((event.ticketsSold / event.capacity) * 100);

  // 2. Velocity — sold% weighted by how close capacity is to being reached
  //    Higher capacity events that sell fast score higher
  const velocityRaw = (event.ticketsSold / Math.max(event.capacity, 1)) * 100;
  const velocityScore = Math.min(velocityRaw, 100);

  // 3. Going score — normalized against a "viral" threshold of 300
  const goingScore = Math.min((event.going / 300) * 100, 100);

  // 4. Friends score — each friend is a strong signal, cap at 5
  const friendsScore = Math.min((event.friendsGoing.length / 5) * 100, 100);

  // 5. Comments score — normalized against 50 comments as "high activity"
  const commentsScore = Math.min((event.comments / 50) * 100, 100);

  // Weighted total
  const totalScore = Math.round(
    velocityScore * 0.3 +
    goingScore * 0.25 +
    friendsScore * 0.25 +
    commentsScore * 0.2
  );

  return {
    soldPercent,
    goingScore: Math.round(goingScore),
    friendsScore: Math.round(friendsScore),
    commentsScore: Math.round(commentsScore),
    velocityScore: Math.round(velocityScore),
    totalScore: Math.min(totalScore, 100),
  };
};

/**
 * Returns applicable badges for an event based on its popularity signals.
 */
export const getPopularityBadges = (event: EventData): PopularityBadge[] => {
  const signals = calculatePopularity(event);
  const badges: PopularityBadge[] = [];

  // Almost Sold Out — highest priority
  if (signals.soldPercent >= 85) {
    badges.push({ label: "ALMOST SOLD OUT", emoji: "🔥", type: "almost_sold_out" });
  }

  // Trending — high composite score
  if (signals.totalScore >= 60 && signals.soldPercent < 85) {
    badges.push({ label: "TRENDING IN HELSINKI", emoji: "🔥", type: "trending" });
  }

  // Hot — moderate composite score
  if (signals.totalScore >= 40 && signals.totalScore < 60) {
    badges.push({ label: "HOT", emoji: "🔥", type: "hot" });
  }

  // Friends Going — social proof
  if (event.friendsGoing.length >= 3) {
    badges.push({
      label: `${event.friendsGoing.length} FRIENDS GOING`,
      emoji: "👯",
      type: "friends_going",
    });
  }

  return badges;
};

/**
 * Sorts events by popularity score (descending).
 */
export const sortByPopularity = (events: EventData[]): EventData[] => {
  return [...events].sort((a, b) => {
    const scoreA = calculatePopularity(a).totalScore;
    const scoreB = calculatePopularity(b).totalScore;
    return scoreB - scoreA;
  });
};

/**
 * Returns a human-readable heat level for the score.
 */
export const getHeatLevel = (score: number): string => {
  if (score >= 80) return "On Fire";
  if (score >= 60) return "Trending";
  if (score >= 40) return "Hot";
  if (score >= 20) return "Warm";
  return "Chill";
};
