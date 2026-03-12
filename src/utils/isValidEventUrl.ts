/**
 * Checks whether a URL points to a specific event page (not a generic listing).
 * Covers: Kide, Resident Advisor, Eventbrite, Dice, Meetup, Facebook, and generic patterns.
 */
export function isValidEventUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  const validPatterns = [
    /\/events\/.+/,    // /events/{id}
    /\/event\/.+/,     // /event/{slug}
    /\/e\/.+/,         // shorthand /e/{id}
    /\/tickets\/.+/,   // /tickets/{id}
    /\/ticket\/.+/,    // /ticket/{id}
  ];

  return validPatterns.some((p) => p.test(url));
}
