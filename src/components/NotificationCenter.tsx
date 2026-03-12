import { Bell, X, Check, CheckCheck, Trash2, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { getNotificationMeta, NotificationType } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";

const typeStyles: Record<NotificationType, string> = {
  trending: "border-l-primary",
  almost_sold_out: "border-l-destructive",
  friends_attending: "border-l-success",
  starting_soon: "border-l-[hsl(40,100%,50%)]",
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    enablePush,
    pushEnabled,
  } = useNotifications();

  const handleNotificationClick = (notifId: string, eventId: string) => {
    markAsRead(notifId);
    setOpen(false);
    navigate(`/event/${eventId}`);
  };

  return (
    <>
      {/* Bell trigger — floats at top right */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed top-12 right-4 z-40 p-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border"
      >
        <Bell size={20} className="text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive flex items-center justify-center"
          >
            <span className="text-[10px] font-mono font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-card border-l border-border overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-5 pt-12 pb-4 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-heading font-bold text-foreground">Notifications</h2>
                  <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-secondary">
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!pushEnabled && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={enablePush}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold"
                    >
                      <BellRing size={12} />
                      ENABLE PUSH
                    </motion.button>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-mono text-muted-foreground"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-mono text-muted-foreground"
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div className="px-4 py-3 space-y-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-heading text-muted-foreground">No notifications yet</p>
                    <p className="text-xs font-mono text-muted-foreground/60 mt-1">
                      We'll notify you about events you care about
                    </p>
                  </div>
                ) : (
                  notifications.map((notif, i) => {
                    const meta = getNotificationMeta(notif.type);
                    return (
                      <motion.button
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleNotificationClick(notif.id, notif.eventId)}
                        className={`w-full text-left p-3.5 rounded-xl border-l-[3px] transition-colors ${
                          typeStyles[notif.type]
                        } ${
                          notif.read
                            ? "bg-secondary/50"
                            : "bg-secondary"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0 mt-0.5">{meta.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-heading font-bold text-foreground truncate">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs font-mono text-muted-foreground leading-relaxed line-clamp-2">
                              {notif.body}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1.5">
                              {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
