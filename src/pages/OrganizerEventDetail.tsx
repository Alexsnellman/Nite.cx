import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import { ArrowLeft, Ticket, DollarSign, Eye, Share2, MessageCircle, TrendingUp, Download, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import PopularityBadges from "@/components/PopularityBadges";
import { getPopularityBadges, calculatePopularity } from "@/lib/popularity";
import ShareSheet from "@/components/ShareSheet";
import CrowdGrowthChart from "@/components/CrowdGrowthChart";

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === id);
  const [shareOpen, setShareOpen] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-mono">Event not found.</p>
      </div>
    );
  }

  const signals = calculatePopularity(event);
  const badges = getPopularityBadges(event);
  const soldPercent = signals.soldPercent;

  // Mock attendees
  const mockAttendees = [
    "Alex M.", "Jordan K.", "Sam W.", "Maya L.", "Chris T.", "Taylor R.",
    "Riley P.", "Casey D.", "Morgan S.", "Jamie N.", "Quinn B.", "Avery H.",
  ].slice(0, Math.min(12, event.ticketsSold));

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-heading font-bold text-foreground truncate">{event.title}</h1>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Event Analytics</p>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-5">
        <PopularityBadges badges={badges} size="md" />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Ticket, label: "Tickets Sold", value: `${event.ticketsSold} / ${event.capacity}`, color: "text-primary" },
          { icon: DollarSign, label: "Revenue", value: `€${event.revenue.toLocaleString()}`, color: "text-success" },
          { icon: Eye, label: "Page Views", value: event.viewCount.toLocaleString(), color: "text-foreground" },
          { icon: Share2, label: "Shares", value: event.shareCount.toString(), color: "text-foreground" },
          { icon: MessageCircle, label: "Comments", value: event.comments.toString(), color: "text-foreground" },
          { icon: TrendingUp, label: "Velocity", value: `${event.salesVelocity}/hr`, color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ticket progress */}
      <div className="bg-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Ticket Progress</span>
          <span className="text-sm font-mono font-bold text-foreground">{soldPercent}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${soldPercent}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${
              soldPercent >= 90 ? "bg-destructive" :
              soldPercent >= 70 ? "bg-primary" :
              "bg-muted-foreground"
            }`}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono text-muted-foreground">{event.ticketsSold} sold</span>
          <span className="text-[10px] font-mono text-muted-foreground">{event.capacity - event.ticketsSold} remaining</span>
        </div>
      </div>

      {/* Crowd Growth Chart */}
      <div className="bg-card rounded-xl p-4 mb-6">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Crowd Growth</h3>
        <CrowdGrowthChart data={event.crowdGrowth} />
      </div>

      {/* Attendee list */}
      <div className="bg-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Attendees</span>
          </div>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-[10px] font-mono text-muted-foreground">
            <Download size={10} />
            Export
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockAttendees.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2 py-2 px-2.5 bg-secondary rounded-lg"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">{name[0]}</span>
              </div>
              <span className="text-xs font-heading text-foreground truncate">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Promotion tools */}
      <div className="bg-card rounded-xl p-4 mb-6">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Promote</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Share Event", emoji: "📤", action: () => setShareOpen(true) },
            { label: "Promo Link", emoji: "🔗", action: () => {} },
            { label: "Invite Followers", emoji: "👥", action: () => {} },
            { label: "Boost Event", emoji: "🚀", action: () => {} },
          ].map(({ label, emoji, action }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.95 }}
              onClick={action}
              className="flex items-center gap-2 py-3 px-3 bg-secondary rounded-xl"
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-mono text-foreground">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {event && <ShareSheet event={event} open={shareOpen} onClose={() => setShareOpen(false)} />}
    </div>
  );
};

export default OrganizerEventDetail;
