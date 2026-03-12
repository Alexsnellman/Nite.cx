import { Search, SlidersHorizontal, Map } from "lucide-react";
import { useState } from "react";
import { mockEvents } from "@/data/mockEvents";
import { useNavigate } from "react-router-dom";

const filters = ["Tonight", "This Weekend", "Free Events", "Student Parties"];
const genres = ["Techno", "House", "Mixed", "Industrial Techno", "Drum & Bass"];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = mockEvents.filter((e) => {
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.location.toLowerCase().includes(query.toLowerCase()) ||
      e.genre.toLowerCase().includes(query.toLowerCase());

    const matchesFilter =
      !activeFilter ||
      (activeFilter === "Free Events" && e.price === 0) ||
      (activeFilter === "Student Parties" && e.genre === "Mixed") ||
      activeFilter === "Tonight" ||
      activeFilter === "This Weekend";

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      {/* Search input */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events, venues, genres..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card rounded-xl pl-11 pr-12 py-3.5 text-foreground font-mono text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-secondary">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wide whitespace-nowrap transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Live Party Map button */}
      <button
        onClick={() => navigate("/map")}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/30 mb-6 transition-colors hover:bg-primary/20"
      >
        <Map size={18} className="text-primary" />
        <span className="text-sm font-heading font-bold text-primary">Live Party Map</span>
      </button>

      {/* Genre chips */}
      <div className="mb-6">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          Genres
        </h3>
        <div className="flex gap-2 flex-wrap">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setQuery(g)}
              className="px-3 py-1.5 rounded-full bg-secondary text-foreground/70 text-xs font-mono hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="flex gap-3 p-3 bg-card rounded-xl cursor-pointer hover:bg-card/80 transition-colors"
          >
            <img
              src={event.image}
              alt={event.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-foreground text-sm truncate">
                {event.title}
              </h3>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {event.date} · {event.time}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-foreground font-bold">
                  {event.currency}{event.price}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {event.going} going
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
