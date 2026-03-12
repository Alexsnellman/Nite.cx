import { useEffect } from "react";
import { EventData } from "@/data/mockEvents";

/**
 * Dynamically sets OG meta tags for social sharing preview cards.
 * On unmount, restores the default site meta.
 */
export const useShareMeta = (event: EventData | undefined) => {
  useEffect(() => {
    if (!event) return;

    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const description = `🎟️ ${event.currency}${event.price} · 📍 ${event.location} · 📅 ${event.date} · ${event.going} going · ${Math.round((event.ticketsSold / event.capacity) * 100)}% sold`;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // OG tags
    document.title = `${event.title} — Night Moves`;
    setMeta("og:title", `${event.title} — Night Moves`);
    setMeta("og:description", description);
    setMeta("og:url", eventUrl);
    setMeta("og:type", "website");
    setMeta("og:image", event.image);

    // Twitter Card tags
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", `${event.title} — Night Moves`);
    setNameMeta("twitter:description", description);
    setNameMeta("twitter:image", event.image);

    return () => {
      document.title = "Night Moves — Local Party Discovery";
      setMeta("og:title", "Night Moves — Local Party Discovery");
      setMeta("og:description", "Discover and buy tickets to the best local parties.");
      setMeta("og:type", "website");
    };
  }, [event]);
};
