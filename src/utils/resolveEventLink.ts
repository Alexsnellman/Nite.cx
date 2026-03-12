import { isValidEventUrl } from "./isValidEventUrl";

/**
 * Generic listing-page patterns that should NEVER be used as an event link.
 * Matches bare /events, /events/, /events?..., /events#... across known platforms.
 */
const GENERIC_PATTERNS = [
  /\/events\/?$/i,
  /\/events\/?[?#]/i,
  /residentadvisor\.net\/events\/?$/i,
  /ra\.co\/events\/?$/i,
  /dice\.fm\/events\/?$/i,
  /kide\.app\/(?:en\/)?events\/?$/i,
  /ticketmaster\.\w+\/events\/?$/i,
  /eventbrite\.\w+\/events\/?$/i,
  /meetup\.com\/events\/?$/i,
  /facebook\.com\/events\/?$/i,
];

interface EventLike {
  id: string;
  event_url?: string | null;
  ticket_url?: string | null;
  source_url?: string | null;
}

export function resolveEventLink(event: EventLike): { href: string; isExternal: boolean } {
  const candidate = event.event_url || event.ticket_url || event.source_url;

  if (!candidate) {
    return { href: `/events/${event.id}`, isExternal: false };
  }

  const isGeneric = GENERIC_PATTERNS.some((p) => p.test(candidate));

  if (isGeneric) {
    return { href: `/events/${event.id}`, isExternal: false };
  }

  // If URL has a valid event path, treat as external
  if (isValidEventUrl(candidate)) {
    return { href: candidate, isExternal: candidate.startsWith("http") };
  }

  // Non-generic external URL (could be a custom website)
  if (candidate.startsWith("http")) {
    return { href: candidate, isExternal: true };
  }

  return { href: `/events/${event.id}`, isExternal: false };
}
