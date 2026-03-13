import { useParams, useNavigate } from "react-router-dom";
// Real events from Supabase
import { ArrowLeft, MapPin, Clock, Music, User, Users, Share2, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ShareSheet from "@/components/ShareSheet";
import { useShareMeta } from "@/hooks/useShareMeta";
import PopularityBadges from "@/components/PopularityBadges";
import { getPopularityBadges, calculatePopularity } from "@/lib/popularity";
import CrowdGrowthChart from "@/components/CrowdGrowthChart";
import { useEvents } from "@/hooks/useEvents";
import { usePurchaseTicket } from "@/hooks/useTickets";
import { toast } from "sonner";
import LiveMomentsFeed from "@/components/LiveMomentsFeed";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dbEvents = [] } = useEvents();
  const purchaseTicket = usePurchaseTicket();
  const [shareOpen, setShareOpen] = useState(false);

  const event = dbEvents.find((e) => e.id === id);

  useShareMeta(event);

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
  const remaining = event.capacity - event.ticketsSold;

  const handleBuy = async () => {
    try {
      await purchaseTicket.mutateAsync(event.id);
      toast.success("Ticket purchased! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Purchase failed");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-[50vh]">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-overlay" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-10 p-2 rounded-full bg-background/40 backdrop-blur-sm"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="absolute top-12 right-4 z-10 p-2 rounded-full bg-background/40 backdrop-blur-sm"
        >
          <Share2 size={22} className="text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 -mt-16 relative z-10">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{event.title}</h1>

        {badges.length > 0 && (
          <div className="mb-4">
            <PopularityBadges badges={badges} size="md" />
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <MapPin size={16} className="text-primary" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <Clock size={16} className="text-primary" />
            {event.date} · {event.time}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <Music size={16} className="text-primary" />
            {event.genre}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <User size={16} className="text-primary" />
            {event.organizer}
          </div>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed mb-6">{event.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-lg p-3 text-center">
            <p className="text-xl font-heading font-bold text-foreground">{event.going}</p>
            <p className="text-xs font-mono text-muted-foreground">GOING</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center">
            <p className="text-xl font-heading font-bold text-foreground">{soldPercent}%</p>
            <p className="text-xs font-mono text-muted-foreground">SOLD</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center">
            <p className="text-xl font-heading font-bold text-foreground">{remaining}</p>
            <p className="text-xs font-mono text-muted-foreground">LEFT</p>
          </div>
        </div>

        {/* Crowd Growth */}
        {event.crowdGrowth.length > 0 && (
          <div className="bg-card rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Crowd Growth</span>
            </div>
            <CrowdGrowthChart data={event.crowdGrowth} height={120} />
          </div>
        )}

        {event.friendsGoing.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">Friends Going</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {event.friendsGoing.map((name) => (
                <span key={name} className="px-3 py-1.5 rounded-full bg-card text-sm font-mono text-foreground/80">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.friendsHere.length > 0 && (
          <div className="mb-6 px-4 py-3 bg-success/10 rounded-xl border border-success/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-mono text-success">
                👯 {event.friendsHere.join(", ")} {event.friendsHere.length === 1 ? "is" : "are"} here now
              </span>
            </div>
          </div>
        )}

        {/* Live Party Moments */}
        <LiveMomentsFeed eventId={event.id} />

        {/* Ticket price + buy */}
        <div className="bg-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Ticket Price</p>
              <p className="text-3xl font-heading font-bold text-foreground">
                {event.currency}{event.price}
              </p>
            </div>
            {remaining < 20 && (
              <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-mono font-bold">
                {remaining} LEFT
              </span>
            )}
          </div>

          {purchaseTicket.isSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-full py-4 rounded-lg bg-card border border-primary/30 text-primary font-heading font-bold text-base tracking-wider uppercase mb-3">
                ✓ TICKET PURCHASED
              </div>
              <button
                onClick={() => navigate("/tickets")}
                className="text-sm font-mono text-primary underline underline-offset-4"
              >
                View QR Ticket →
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBuy}
              disabled={purchaseTicket.isPending}
              className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase btn-pulse disabled:opacity-50"
            >
              {purchaseTicket.isPending ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                `BUY TICKET · ${event.currency}${event.price}`
              )}
            </motion.button>
          )}
        </div>
      </div>

      {event && <ShareSheet event={event} open={shareOpen} onClose={() => setShareOpen(false)} />}
    </div>
  );
};

export default EventDetail;
