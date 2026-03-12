import { QrCode, MapPin, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyTickets } from "@/hooks/useTickets";

const Tickets = () => {
  const { data: tickets = [], isLoading } = useMyTickets();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">My Tickets</h1>

      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center mt-20">
          <QrCode size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono text-sm">No tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              layout
              onClick={() =>
                setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)
              }
              className="bg-card rounded-xl overflow-hidden cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={ticket.event.image_url || "/placeholder.svg"}
                  alt={ticket.event.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-foreground text-lg truncate">
                    {ticket.event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs mt-1">
                    <Clock size={12} />
                    {ticket.event.date} · {ticket.event.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs mt-1">
                    <MapPin size={12} />
                    {ticket.event.location}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    ticket.status === "valid"
                      ? "bg-primary/20 text-primary"
                      : ticket.status === "used"
                      ? "bg-muted text-muted-foreground"
                      : "bg-destructive/20 text-destructive"
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {selectedTicket === ticket.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-6 flex flex-col items-center">
                      <div className="w-48 h-48 bg-foreground rounded-xl p-3 mb-4">
                        <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                          <QrCode size={80} className="text-foreground" />
                        </div>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground text-center">
                        Show this code at entry
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/50 mt-2">
                        {ticket.qr_code}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
