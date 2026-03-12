import type { ExtractedEvent } from "@/pages/ExtractPage";

export function ExtractedEventCard({ event }: { event: ExtractedEvent }) {
  return (
    <div className="flex gap-4 p-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
            🎵
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
          {(event.venue_name || event.city) && (
            <span>
              📍 {event.venue_name}
              {event.venue_name && event.city ? " — " : ""}
              {event.city}
            </span>
          )}
          {event.date && <span>📅 {event.date}</span>}
          {event.time && <span>🕐 {event.time}</span>}
          {event.ticket_price && (
            <span className="text-accent font-mono">💰 {event.ticket_price}</span>
          )}
        </div>
        {event.venue_address && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            🏠 {event.venue_address}
          </p>
        )}
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
