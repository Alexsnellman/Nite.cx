import { useState, useMemo } from "react";
import EventFeedCard from "@/components/EventFeedCard";
import { EventData } from "@/data/mockEvents";
import { sortByPopularity, calculatePopularity } from "@/lib/popularity";
import { useEvents } from "@/hooks/useEvents";
import { Loader2, MapPin, GraduationCap, Flame, ChevronUp, ChevronDown, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LiveFeedView from "@/components/LiveFeedView";

const CITY = "Helsinki";

const Feed = () => {
  const navigate = useNavigate();
  const { data: dbEvents, isLoading } = useEvents(CITY);
  const [filter, setFilter] = useState<"all" | "student" | "tonight">("all");
  const [tonightOpen, setTonightOpen] = useState(false);
  const [showLive, setShowLive] = useState(false);

  const allEvents = useMemo(() => dbEvents || [], [dbEvents]);

  // "Tonight" = events happening today
  const tonightEvents = useMemo(() => {
    const now = new Date();
    return sortByPopularity(
      allEvents.filter(event => {
        const todayStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return event.date === todayStr;
      })
    );
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    let events = allEvents;
    if (filter === "student") {
      events = events.filter(e => e.studentEvent);
    } else if (filter === "tonight") {
      events = tonightEvents;
    }
    return sortByPopularity(events);
  }, [allEvents, tonightEvents, filter]);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* City header + filters */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-3 bg-gradient-to-b from-background via-background/80 to-transparent"
      >
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-primary" />
          <h1 className="text-lg font-heading font-bold text-foreground">{CITY}</h1>
          <span className="text-xs font-mono text-muted-foreground ml-1">
            {tonightEvents.length > 0 ? "Tonight" : "This week"}
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-mono font-bold transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("tonight")}
            className={`p-1.5 rounded-full transition-colors ${
              filter === "tonight"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            <Flame size={14} />
          </button>
          <button
            onClick={() => setFilter("student")}
            className={`p-1.5 rounded-full transition-colors ${
              filter === "student"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            <GraduationCap size={14} />
          </button>

          {/* LIVE button */}
          <button
            onClick={() => setShowLive(true)}
            className="px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors bg-destructive/15 text-destructive border border-destructive/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            LIVE
          </button>
        </div>
      </motion.div>

      {/* Tonight section */}
      {filter === "all" && tonightEvents.length > 0 && (
        <div className="absolute top-[120px] left-0 right-0 z-30 px-4">
          <button
            onClick={() => setTonightOpen(!tonightOpen)}
            className="w-full bg-card rounded-xl border border-border p-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex-1">
                Tonight in {CITY}
              </span>
              {tonightOpen
                ? <ChevronDown size={16} className="text-muted-foreground" />
                : <ChevronUp size={16} className="text-muted-foreground" />}
            </div>

            {tonightOpen && (
              <div className="space-y-2 mt-3" onClick={(e) => e.stopPropagation()}>
                {tonightEvents.slice(0, 3).map((event) => {
                  const signals = calculatePopularity(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="w-full flex items-center gap-3 py-1.5 text-left"
                    >
                      <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-heading font-bold text-foreground truncate">
                          {event.studentEvent ? "🎓 " : "🔥 "}{event.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">👥 {event.going} going</span>
                          <span className="text-[10px] font-mono text-primary">🎟 {signals.soldPercent}% sold</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Main feed */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        {filteredEvents.map((event) => (
          <EventFeedCard key={event.id} event={event} />
        ))}
        {filteredEvents.length === 0 && (
          <div className="h-[100dvh] flex items-center justify-center">
            <p className="text-muted-foreground font-mono text-sm">No events found</p>
          </div>
        )}
      </div>

      {/* LIVE overlay */}
      <AnimatePresence>
        {showLive && <LiveFeedView onClose={() => setShowLive(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
