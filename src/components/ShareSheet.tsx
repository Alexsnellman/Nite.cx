import { X, Link2, Copy, Check, Send, MessageSquare, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { EventData } from "@/data/mockEvents";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationContext";

interface ShareSheetProps {
  event: EventData;
  open: boolean;
  onClose: () => void;
}

const MOCK_FRIENDS = [
  { name: "Alex", avatar: "🧑‍🎤" },
  { name: "Sam", avatar: "🧑‍💻" },
  { name: "Lina", avatar: "💃" },
  { name: "Jordan", avatar: "🎧" },
  { name: "Maya", avatar: "🎨" },
  { name: "Taylor", avatar: "🕺" },
  { name: "Chris", avatar: "🎵" },
];

const MOCK_GROUPS = [
  { name: "Friday crew 🔥", members: 8 },
  { name: "Helsinki techno gang", members: 14 },
  { name: "Uni friends", members: 6 },
];

const ShareSheet = ({ event, open, onClose }: ShareSheetProps) => {
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState<string[]>([]);
  const [sentToGroups, setSentToGroups] = useState<string[]>([]);

  const eventUrl = `${window.location.origin}/event/${event.id}`;
  const inviteMessage = `Join me at ${event.title} tonight.\n\nDownload the app and get tickets:\n${eventUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleInviteFriend = (name: string) => {
    setInviteSent((prev) => [...prev, name]);
    toast.success(`Invite sent to ${name}!`, { icon: "🎉" });
  };

  const handleSendToGroup = (groupName: string) => {
    setSentToGroups((prev) => [...prev, groupName]);
    toast.success(`Event shared to ${groupName}`, { icon: "💬" });
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: "💬",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, "_blank"),
    },
    {
      name: "Telegram",
      icon: "✈️",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Join me at ${event.title}!`)}`, "_blank"),
    },
    {
      name: "Instagram",
      icon: "📸",
      action: () => {
        handleCopyLink();
        toast("Link copied — paste it in your Instagram story!", { icon: "📸" });
      },
    },
    {
      name: "Copy Link",
      icon: copied ? "✅" : "🔗",
      action: handleCopyLink,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground">Invite Friends</h3>
                <button onClick={onClose} className="p-2 rounded-full bg-secondary">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Event preview */}
              <div className="bg-secondary rounded-xl p-3 mb-5 flex gap-3">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-heading font-bold text-foreground truncate">{event.title}</p>
                  <p className="text-xs font-mono text-muted-foreground">{event.date} · {event.time}</p>
                  <p className="text-xs font-mono text-primary">{event.going} going</p>
                </div>
              </div>

              {/* Friends on the app */}
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-primary" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Friends on the app
                </p>
              </div>
              <div className="space-y-2 mb-6">
                {MOCK_FRIENDS.map((friend) => {
                  const isSent = inviteSent.includes(friend.name);
                  return (
                    <div key={friend.name} className="flex items-center justify-between py-2 px-3 bg-secondary rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-base">{friend.avatar}</span>
                        </div>
                        <span className="text-sm font-heading font-medium text-foreground">{friend.name}</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => !isSent && handleInviteFriend(friend.name)}
                        disabled={isSent}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-colors ${
                          isSent
                            ? "bg-success/20 text-success"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isSent ? "SENT ✓" : "INVITE"}
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Send to group chat */}
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-primary" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Send to Chat
                </p>
              </div>
              <div className="space-y-2 mb-6">
                {MOCK_GROUPS.map((group) => {
                  const isSent = sentToGroups.includes(group.name);
                  return (
                    <div key={group.name} className="flex items-center justify-between py-2 px-3 bg-secondary rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                          <MessageSquare size={16} className="text-accent" />
                        </div>
                        <div>
                          <span className="text-sm font-heading font-medium text-foreground block">{group.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{group.members} members</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => !isSent && handleSendToGroup(group.name)}
                        disabled={isSent}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-colors ${
                          isSent
                            ? "bg-success/20 text-success"
                            : "bg-secondary border border-border text-foreground"
                        }`}
                      >
                        {isSent ? "SENT ✓" : "SEND"}
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* External invite */}
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Invite externally
              </p>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {socialPlatforms.map((platform) => (
                  <motion.button
                    key={platform.name}
                    whileTap={{ scale: 0.9 }}
                    onClick={platform.action}
                    className="flex flex-col items-center gap-2 min-w-[64px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
                      {platform.icon}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareSheet;
