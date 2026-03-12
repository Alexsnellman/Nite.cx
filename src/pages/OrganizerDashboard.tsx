import { useNavigate } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import { ArrowLeft, Plus, MapPin, Ticket, DollarSign, Eye, Share2, BarChart3, QrCode, Pencil, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { calculatePopularity, getPopularityBadges } from "@/lib/popularity";
import PopularityBadges from "@/components/PopularityBadges";

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [isOrganizer] = useState(true);
  const [expandedFriends, setExpandedFriends] = useState<string | null>(null);

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-xs"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎤</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Become an Organizer</h2>
          <p className="text-sm font-mono text-muted-foreground mb-6">Create and manage your own events.</p>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-heading font-bold text-sm">
            Apply Now
          </button>
        </motion.div>
      </div>
    );
  }

  // Get today's date string for matching
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Group events
  const tonight = mockEvents.filter((e) => e.date === todayStr);
  const upcoming = mockEvents.filter((e) => e.date !== todayStr);
  const totalRevenue = mockEvents.reduce((sum, e) => sum + e.revenue, 0);
  const totalTickets = mockEvents.reduce((sum, e) => sum + e.ticketsSold, 0);

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Organizer</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Control Center</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/create-event")}
          className="p-2.5 rounded-full bg-primary"
        >
          <Plus size={20} className="text-primary-foreground" />
        </motion.button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-xl font-heading font-bold text-foreground">{mockEvents.length}</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Events</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-xl font-heading font-bold text-foreground">{totalTickets}</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Sold</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-xl font-heading font-bold text-primary">€{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Revenue</p>
        </div>
      </div>

      {/* Event sections */}
      {[
        { title: "Tonight", events: tonight },
        { title: "Upcoming", events: upcoming },
      ].map(({ title, events }) =>
        events.length > 0 ? (
          <div key={title} className="mb-8">
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">{title}</h2>
            <div className="space-y-3">
              {events.map((event, i) => {
                const signals = calculatePopularity(event);
                const badges = getPopularityBadges(event);
                const soldPercent = signals.soldPercent;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl overflow-hidden"
                  >
                    {/* Card header with image */}
                    <div className="flex gap-3 p-3">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-heading font-bold text-foreground truncate">{event.title}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-primary flex-shrink-0" />
                          <span className="text-[11px] font-mono text-muted-foreground truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] font-mono text-muted-foreground">{event.date} · {event.time}</span>
                        </div>
                        <div className="mt-1.5">
                          <PopularityBadges
                            badges={badges.filter(b => b.type !== "friends_going").slice(0, 2)}
                          />
                          {event.friendsGoing.length > 0 && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setExpandedFriends(expandedFriends === event.id ? null : event.id)}
                              className="mt-1.5 inline-flex items-center gap-1 rounded-full font-mono font-bold tracking-wide bg-success/20 text-success px-2.5 py-1 text-xs"
                            >
                              👯 {event.friendsGoing.length} FRIENDS GOING
                            </motion.button>
                          )}
                        </div>
                        <AnimatePresence>
                          {expandedFriends === event.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden mt-2"
                            >
                              <div className="bg-success/10 rounded-lg p-2 space-y-1">
                                {event.friendsGoing.map((friend) => (
                                  <div key={friend} className="flex items-center gap-2 py-0.5">
                                    <div className="w-5 h-5 rounded-full bg-success/30 flex items-center justify-center text-[10px] text-success font-bold">
                                      {friend[0]}
                                    </div>
                                    <span className="text-[11px] font-mono text-foreground">{friend}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-4 gap-0 border-t border-border">
                      <div className="py-2.5 text-center border-r border-border">
                        <div className="flex items-center justify-center gap-1">
                          <Ticket size={11} className="text-primary" />
                          <span className="text-xs font-mono font-bold text-foreground">{event.ticketsSold}/{event.capacity}</span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">TICKETS</p>
                      </div>
                      <div className="py-2.5 text-center border-r border-border">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign size={11} className="text-success" />
                          <span className="text-xs font-mono font-bold text-foreground">€{event.revenue}</span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">REVENUE</p>
                      </div>
                      <div className="py-2.5 text-center border-r border-border">
                        <div className="flex items-center justify-center gap-1">
                          <Eye size={11} className="text-muted-foreground" />
                          <span className="text-xs font-mono font-bold text-foreground">{event.viewCount}</span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">VIEWS</p>
                      </div>
                      <div className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Share2 size={11} className="text-muted-foreground" />
                          <span className="text-xs font-mono font-bold text-foreground">{event.shareCount}</span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">SHARES</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-3 py-2 border-t border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">Ticket Progress</span>
                        <span className="text-[10px] font-mono font-bold text-foreground">{soldPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${soldPercent}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={`h-full rounded-full ${
                            soldPercent >= 90 ? "bg-destructive" :
                            soldPercent >= 70 ? "bg-primary" :
                            "bg-muted-foreground"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-0 border-t border-border">
                      <button
                        onClick={() => navigate(`/organizer/event/${event.id}`)}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border-r border-border"
                      >
                        <BarChart3 size={13} />
                        Analytics
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border-r border-border"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate("/admin-scan")}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                      >
                        <QrCode size={13} />
                        Scan
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default OrganizerDashboard;
