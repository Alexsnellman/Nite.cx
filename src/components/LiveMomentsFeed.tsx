import { useState } from "react";
import { Camera, Flag, EyeOff, Clock, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMoments, useMomentCount, useReportMoment, Moment } from "@/hooks/useMoments";
import PostMomentSheet from "./PostMomentSheet";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface LiveMomentsFeedProps {
  eventId: string;
}

const MomentCard = ({ moment, eventId }: { moment: Moment; eventId: string }) => {
  const [showActions, setShowActions] = useState(false);
  const reportMoment = useReportMoment();

  const handleReport = async () => {
    await reportMoment.mutateAsync({ momentId: moment.id, eventId });
    toast.success("Moment reported");
    setShowActions(false);
  };

  const timeAgo = formatDistanceToNow(new Date(moment.created_at), { addSuffix: true });
  const initials = (moment.user_name || "?")[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-xl overflow-hidden bg-card border border-border group"
    >
      {/* Media */}
      {moment.media_type === "video" ? (
        <video
          src={moment.media_url}
          className="w-full aspect-[3/4] object-cover"
          controls
          playsInline
          muted
          preload="metadata"
        />
      ) : (
        <img
          src={moment.media_url}
          alt={moment.caption || "Party moment"}
          className="w-full aspect-[3/4] object-cover"
          loading="lazy"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

      {/* User info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-2 mb-1">
          {moment.user_photo ? (
            <img src={moment.user_photo} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            </div>
          )}
          <span className="text-xs font-heading font-bold text-foreground truncate flex-1">
            {moment.user_name}
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-muted-foreground text-xs"
          >
            •••
          </button>
        </div>

        {moment.caption && (
          <p className="text-[11px] font-mono text-foreground/80 line-clamp-2 mb-1">
            {moment.caption}
          </p>
        )}

        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock size={10} />
          <span className="text-[9px] font-mono">{timeAgo}</span>
        </div>
      </div>

      {/* Actions dropdown */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-2 right-2 bg-card rounded-lg border border-border shadow-lg overflow-hidden z-10"
          >
            <button
              onClick={handleReport}
              className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-destructive hover:bg-destructive/10 w-full"
            >
              <Flag size={12} />
              Report
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground hover:bg-muted w-full"
            >
              <EyeOff size={12} />
              Hide
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LiveMomentsFeed = ({ eventId }: LiveMomentsFeedProps) => {
  const { data: moments = [], isLoading } = useMoments(eventId);
  const { data: recentCount = 0 } = useMomentCount(eventId);
  const [postOpen, setPostOpen] = useState(false);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider">
            Live Party
          </h3>
          {recentCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
              <Flame size={10} />
              {recentCount} in 10min
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setPostOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-heading font-bold"
        >
          <Camera size={14} />
          Add Moment
        </motion.button>
      </div>

      {/* Moments grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <button
          onClick={() => setPostOpen(true)}
          className="w-full py-8 rounded-xl border-2 border-dashed border-border flex flex-col items-center gap-2 hover:border-primary/30 transition-colors"
        >
          <Camera size={28} className="text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">Be the first to post a moment!</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {moments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} eventId={eventId} />
          ))}
        </div>
      )}

      <PostMomentSheet eventId={eventId} open={postOpen} onClose={() => setPostOpen(false)} />
    </div>
  );
};

export default LiveMomentsFeed;
