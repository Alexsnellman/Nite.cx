import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: Date;
}

const MOCK_COMMENTS: Comment[] = [
  { id: "1", user: "Alex", avatar: "🧑‍🎤", text: "This is insane 🔥🔥", time: new Date(Date.now() - 120000) },
  { id: "2", user: "Lina", avatar: "💃", text: "who's coming tonight??", time: new Date(Date.now() - 300000) },
  { id: "3", user: "Jordan", avatar: "🎧", text: "The DJ lineup is crazy", time: new Date(Date.now() - 600000) },
  { id: "4", user: "Sam", avatar: "🧑‍💻", text: "Got my ticket! See you there", time: new Date(Date.now() - 900000) },
  { id: "5", user: "Maya", avatar: "🎨", text: "Best venue in Helsinki 💜", time: new Date(Date.now() - 1500000) },
  { id: "6", user: "Taylor", avatar: "🕺", text: "Last time was legendary", time: new Date(Date.now() - 2400000) },
  { id: "7", user: "Chris", avatar: "🎵", text: "Bringing the whole crew", time: new Date(Date.now() - 3600000) },
];

interface CommentsOverlayProps {
  open: boolean;
  onClose: () => void;
  commentCount?: number;
}

const CommentsOverlay = ({ open, onClose, commentCount }: CommentsOverlayProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-30 flex items-end"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[50%] bg-background/90 backdrop-blur-md rounded-t-2xl border-t border-border overflow-hidden"
          >
            {/* Handle + title */}
            <div className="flex flex-col items-center pt-3 pb-2 px-5 border-b border-border/50">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <p className="text-xs font-mono text-muted-foreground">
                {commentCount ?? MOCK_COMMENTS.length} comments · tap outside to close
              </p>
            </div>

            {/* Comments list */}
            <div className="overflow-y-auto max-h-[calc(50vh-60px)] px-4 py-3 space-y-3">
              {MOCK_COMMENTS.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{c.avatar}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-heading font-bold text-foreground">{c.user}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatDistanceToNow(c.time, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-foreground/80 leading-snug">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsOverlay;
