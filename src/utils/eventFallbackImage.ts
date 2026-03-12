/**
 * Deterministic fallback image selection with pool-based diversity
 * and anti-collision layout algorithm.
 */

const CATEGORIES = [
  "nightlife", "concert", "festival", "art", "theatre",
  "sports", "conference", "food", "community",
] as const;

type EventCategory = typeof CATEGORIES[number];

/** Number of images per category (original + 2 variants) */
const POOL_SIZE = 3;

/** Category color gradients for overlay diversity */
export const CATEGORY_GRADIENTS: Record<EventCategory, string> = {
  nightlife: "from-purple-900/60 to-indigo-900/40",
  concert: "from-red-900/60 to-rose-900/40",
  festival: "from-orange-900/60 to-amber-900/40",
  art: "from-blue-900/60 to-cyan-900/40",
  theatre: "from-rose-900/60 to-pink-900/40",
  sports: "from-green-900/60 to-emerald-900/40",
  conference: "from-slate-900/60 to-gray-900/40",
  food: "from-yellow-900/60 to-orange-900/40",
  community: "from-teal-900/60 to-sky-900/40",
};

const CATEGORY_ALIASES: Record<string, EventCategory> = {
  nightlife: "nightlife",
  club: "nightlife",
  party: "nightlife",
  dj: "nightlife",
  techno: "nightlife",
  concert: "concert",
  live_music: "concert",
  gig: "concert",
  festival: "festival",
  art: "art",
  exhibition: "art",
  gallery: "art",
  theatre: "theatre",
  theater: "theatre",
  comedy: "theatre",
  sports: "sports",
  sport: "sports",
  conference: "conference",
  seminar: "conference",
  workshop: "conference",
  food: "food",
  dining: "food",
  community: "community",
  general_event: "community",
  other: "community",
};

export function resolveCategory(eventType?: string | null): EventCategory {
  if (!eventType) return "community";
  const lower = eventType.toLowerCase().replace(/[\s-]/g, "_");
  return CATEGORY_ALIASES[lower] || "community";
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic fallback image path from the pool.
 * Pool: {category}.jpg, {category}-2.jpg, {category}-3.jpg
 */
export function getEventFallbackImage(eventId: string, eventType?: string | null): string {
  const category = resolveCategory(eventType);
  const hash = simpleHash(eventId);
  const index = hash % POOL_SIZE;
  
  // index 0 = original file, 1 = -2, 2 = -3
  if (index === 0) return `/event-fallbacks/${category}.jpg`;
  return `/event-fallbacks/${category}-${index + 1}.jpg`;
}

/**
 * Returns the image URL to display — either the event's own image or a category fallback.
 */
export function getEventDisplayImage(event: { id: string; image_url?: string | null; event_type?: string | null }): string {
  if (event.image_url) return event.image_url;
  return getEventFallbackImage(event.id, event.event_type);
}

/**
 * Anti-collision layout: reorders events so adjacent cards don't share the same fallback image.
 * Only swaps events that both use fallback images.
 */
export function preventImageCollisions<T extends { id: string; image_url?: string | null; event_type?: string | null }>(
  events: T[]
): T[] {
  if (events.length <= 1) return events;
  
  const result = [...events];
  
  for (let i = 1; i < result.length; i++) {
    // Only check fallback events
    if (result[i].image_url || result[i - 1].image_url) continue;
    
    const imgA = getEventFallbackImage(result[i - 1].id, result[i - 1].event_type);
    const imgB = getEventFallbackImage(result[i].id, result[i].event_type);
    
    if (imgA === imgB) {
      // Find next event with a different fallback to swap
      for (let j = i + 1; j < result.length; j++) {
        const imgJ = result[j].image_url || getEventFallbackImage(result[j].id, result[j].event_type);
        if (imgJ !== imgA) {
          [result[i], result[j]] = [result[j], result[i]];
          break;
        }
      }
    }
  }
  
  return result;
}
