import { useState, useRef } from "react";
import { Camera, Video, X, Loader2, Eye, Users, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostMoment } from "@/hooks/useMoments";
import { toast } from "sonner";

interface PostMomentSheetProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
}

const VISIBILITY_OPTIONS = [
  { value: "attendees", label: "All Attendees", icon: Eye },
  { value: "friends", label: "Friends Only", icon: Users },
  { value: "private", label: "Private", icon: Lock },
];

const PostMomentSheet = ({ eventId, open, onClose }: PostMomentSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postMoment = usePostMoment();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("attendees");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handlePost = async () => {
    if (!file) {
      toast.error("Select a photo or video first");
      return;
    }

    try {
      await postMoment.mutateAsync({
        eventId,
        file,
        caption: caption.trim() || undefined,
        visibility,
      });
      toast.success("Moment posted! 🔥");
      handleReset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to post moment");
    }
  };

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption("");
    setVisibility("attendees");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-2xl border-t border-border p-5 pb-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-foreground">📷 Add Moment</h3>
              <button onClick={handleClose} className="p-1 rounded-full bg-muted">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Media selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!preview ? (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.capture = "environment";
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex-1 h-36 bg-background rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <Camera size={28} className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">Photo</span>
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "video/*";
                      fileInputRef.current.capture = "environment";
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex-1 h-36 bg-background rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <Video size={28} className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">Video</span>
                </button>
              </div>
            ) : (
              <div className="relative mb-4 rounded-xl overflow-hidden">
                {file?.type.startsWith("video") ? (
                  <video src={preview} className="w-full h-48 object-cover rounded-xl" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                )}
                <button
                  onClick={() => {
                    if (preview) URL.revokeObjectURL(preview);
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <X size={14} className="text-foreground" />
                </button>
              </div>
            )}

            {/* Caption */}
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={120}
              className="w-full bg-background rounded-xl px-4 py-3 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary mb-4"
            />

            {/* Visibility */}
            <div className="flex gap-2 mb-5">
              {VISIBILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                      visibility === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    <Icon size={12} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Post button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePost}
              disabled={!file || postMoment.isPending}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {postMoment.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  POSTING...
                </>
              ) : (
                "POST MOMENT 🔥"
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostMomentSheet;
