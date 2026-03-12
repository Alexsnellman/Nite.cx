import { useState } from "react";
import { ArrowLeft, Radio, ChevronRight, User, Heart, MessageCircle, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveEvents, useLiveMoments } from "@/hooks/useLiveFeed";
import { Moment } from "@/hooks/useMoments";
import { formatDistanceToNow } from "date-fns";
import CommentsOverlay from "@/components/CommentsOverlay";
import ShareSheet from "@/components/ShareSheet";
import { mockEvents } from "@/data/mockEvents";
import { toast } from "sonner";

interface LiveFeedViewProps {
  onClose: () => void;
}

const LiveFeedView = ({ onClose }: LiveFeedViewProps) => {
  const { data: liveEvents, isLoading } = useLiveEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = liveEvents?.find((e) => e.id === selectedEventId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-background border-b border-border">
        <button
          onClick={() => {
            if (selectedEventId) setSelectedEventId(null);
            else onClose();
          }}
          className="p-2 rounded-full bg-card"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Radio size={16} className="text-destructive animate-pulse" />
          <h1 className="text-lg font-heading font-bold text-foreground">
            {selectedEvent ? selectedEvent.title : "LIVE"}
          </h1>
        </div>
      </div>

      {!selectedEventId ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Radio size={24} className="text-primary animate-pulse" />
            </div>
          )}
          {!isLoading && (!liveEvents || liveEvents.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Radio size={32} className="text-muted-foreground" />
              <p className="text-sm font-mono text-muted-foreground text-center">No live events right now</p>
            </div>
          )}
          {liveEvents?.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-card/80 transition-colors text-left"
            >
              {event.image_url ? (
                <img src={event.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Radio size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-foreground text-sm truncate">{event.title}</h3>
                <p className="text-xs font-mono text-muted-foreground truncate">{event.location}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-mono text-destructive font-bold">
                    {event.momentCount} moment{event.momentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <MomentShortsFeed eventId={selectedEventId} />
      )}
    </motion.div>
  );
};

const MomentShortsFeed = ({ eventId }: { eventId: string }) => {
  const { data: moments, isLoading } = useLiveMoments(eventId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Radio size={24} className="text-primary animate-pulse" />
      </div>
    );
  }

  if (!moments || moments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
        <Radio size={32} className="text-muted-foreground" />
        <p className="text-sm font-mono text-muted-foreground text-center">No moments yet — be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">
      {moments.map((moment) => (
        <MomentCard key={moment.id} moment={moment} eventId={eventId} />
      ))}
    </div>
  );
};

const MomentCard = ({ moment, eventId }: { moment: Moment; eventId: string }) => {
  const timeAgo = formatDistanceToNow(new Date(moment.created_at), { addSuffix: true });
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const mockEvent = mockEvents.find((e) => e.id === eventId) ?? mockEvents[0];
  const commentCount = 67;

  return (
    <div className="h-[calc(100dvh-60px)] w-full snap-start snap-always flex-shrink-0 relative overflow-hidden bg-background">
      {/* Media — full bleed */}
      {moment.media_type === "video" ? (
        <video
          src={moment.media_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            // Fallback: hide broken video, show placeholder
            (e.target as HTMLVideoElement).style.display = "none";
          }}
        />
      ) : (
        <img
          src={moment.media_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* Right-side action buttons — always visible, overlaying media */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5 z-20">
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={() => {
            setLiked(!liked);
            if (!liked) toast("Saved!", { icon: "💜" });
          }}
          className="flex flex-col items-center gap-1"
        >
          <Heart size={28} className={liked ? "text-primary fill-primary" : "text-foreground"} />
          <span className="text-[10px] font-mono text-foreground/80">{liked ? "Saved" : "Save"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 1.1 }}
          onClick={() => setCommentsOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle size={26} className="text-foreground" />
          <span className="text-[10px] font-mono text-foreground/80">{commentCount}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 1.1 }}
          onClick={() => setShareOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Share2 size={26} className="text-foreground" />
          <span className="text-[10px] font-mono text-foreground/80">Share</span>
        </motion.button>
      </div>

      {/* Bottom info — overlaying media */}
      <div className="absolute bottom-6 left-0 right-16 px-5 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
            {moment.user_photo && moment.user_photo.startsWith("http") ? (
              <img src={moment.user_photo} alt="" className="w-full h-full object-cover" />
            ) : moment.user_photo ? (
              <span className="text-sm">{moment.user_photo}</span>
            ) : (
              <User size={14} className="text-muted-foreground" />
            )}
          </div>
          <span className="text-xs font-mono text-foreground/80">{moment.user_name}</span>
          <span className="text-[10px] font-mono text-foreground/50">· {timeAgo}</span>
        </div>
        {moment.caption && (
          <p className="text-sm font-heading text-foreground/90 leading-snug">{moment.caption}</p>
        )}
      </div>

      {/* Comments overlay — inside the card, overlays the media */}
      <CommentsOverlay open={commentsOpen} onClose={() => setCommentsOpen(false)} commentCount={commentCount} />

      {/* Share sheet */}
      <ShareSheet event={mockEvent} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};

export default LiveFeedView;
