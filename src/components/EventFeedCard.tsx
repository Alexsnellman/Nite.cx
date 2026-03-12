import { Heart, MessageCircle, Share2, MapPin, Clock, Users, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventData } from "@/data/mockEvents";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ShareSheet from "./ShareSheet";
import PostMomentSheet from "./PostMomentSheet";
import { getPopularityBadges, calculatePopularity } from "@/lib/popularity";

interface EventFeedCardProps {
  event: EventData;
}

const EventFeedCard = ({ event }: EventFeedCardProps) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  
  const [momentOpen, setMomentOpen] = useState(false);
  const signals = calculatePopularity(event);
  const badges = getPopularityBadges(event);
  const soldPercent = signals.soldPercent;
  const topBadge = badges[0] || null;

  const friendsHereCount = event.friendsHere.length;
  const friendsGoingCount = event.friendsGoing.length;

  const handleScreenTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    setShowActions((prev) => !prev);
  };

  return (
    <div
      className="relative h-[100dvh] w-full snap-start snap-always flex-shrink-0"
      onClick={handleScreenTap}
    >
      {/* Background Media */}
      {event.video ? (
        <video
          src={event.video}
          poster={event.image}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={event.image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

      {/* Side action buttons — always visible */}
      <div className="absolute right-4 bottom-60 flex flex-col items-center gap-6 z-10">
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            size={28}
            className={saved ? "fill-primary text-primary" : "text-foreground"}
            strokeWidth={1.5}
          />
          <span className="text-xs font-mono text-foreground/70">Save</span>
        </motion.button>

        <button
          className="flex flex-col items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={28} className="text-foreground" strokeWidth={1.5} />
          <span className="text-xs font-mono text-foreground/70">{event.comments}</span>
        </button>

        <motion.button
          whileTap={{ scale: 1.2 }}
          onClick={(e) => {
            e.stopPropagation();
            setShareOpen(true);
          }}
          className="flex flex-col items-center gap-1"
        >
          <Share2 size={28} className="text-foreground" strokeWidth={1.5} />
          <span className="text-xs font-mono text-foreground/70">Share</span>
        </motion.button>
      </div>

      {/* Camera button — always visible */}
      <motion.button
        whileTap={{ scale: 1.2 }}
        onClick={(e) => {
          e.stopPropagation();
          setMomentOpen(true);
        }}
        className="absolute right-4 bottom-44 z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
      >
        <Camera size={22} className="text-primary-foreground" />
      </motion.button>

      {/* Bottom overlay — positioned higher */}
      <div className="absolute bottom-20 left-0 right-16 px-5 z-10">
        {/* Event title — single line, tap to expand downward */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-left w-full max-w-[260px]"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-heading font-bold text-foreground leading-tight truncate">
              {event.studentEvent ? "🎓 " : ""}{event.title}
            </h2>
            {expanded ? (
              <ChevronUp size={16} className="text-foreground/50 flex-shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-foreground/50 flex-shrink-0" />
            )}
          </div>
        </button>

        {/* Single badge */}
        {topBadge && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 rounded-full font-mono font-bold tracking-wide px-2.5 py-1 text-xs mt-2 bg-primary/20 text-primary"
          >
            {topBadge.emoji} {topBadge.label}
          </motion.span>
        )}

        {/* Friends here */}
        {friendsHereCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFriends(!showFriends);
            }}
            className="flex items-center gap-2 mt-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-success">
              👥 {friendsHereCount} {friendsHereCount === 1 ? "friend" : "friends"} here
            </span>
          </button>
        )}

        {/* Friends going — avatar cluster */}
        {friendsGoingCount > 0 && friendsHereCount === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFriends(!showFriends);
            }}
            className="flex items-center gap-1.5 mt-2"
          >
            <div className="flex -space-x-2">
              {event.friendsGoing.slice(0, 3).map((name, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            {friendsGoingCount > 3 && (
              <span className="text-xs font-mono text-success">...</span>
            )}
          </button>
        )}

        {/* Expanded friends panel */}
        <AnimatePresence>
          {showFriends && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              {(() => {
                const friends = friendsHereCount > 0 ? event.friendsHere : event.friendsGoing;
                return (
                  <div className="flex items-center gap-2 flex-wrap">
                    {friends.map((name, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center"
                      >
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded details — drops DOWN from title */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="space-y-2 py-2 px-3 rounded-lg bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-mono text-foreground/70">
                  <MapPin size={14} className="text-primary" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-foreground/70">
                  <Clock size={14} className="text-primary" />
                  {event.date} · {event.time}
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-foreground/70">
                  <span>👥 {event.going} going</span>
                  <span className={soldPercent >= 75 ? "text-destructive" : ""}>
                    🔥 {soldPercent}% sold
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buy ticket button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event/${event.id}`);
          }}
          className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase btn-pulse mt-4"
        >
          BUY TICKET · {event.currency}{event.price}
        </motion.button>
      </div>

      <ShareSheet event={event} open={shareOpen} onClose={() => setShareOpen(false)} />
      <PostMomentSheet eventId={event.id} open={momentOpen} onClose={() => setMomentOpen(false)} />
    </div>
  );
};

export default EventFeedCard;
