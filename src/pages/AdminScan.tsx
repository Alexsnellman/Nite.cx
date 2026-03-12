import { useState } from "react";
import { ScanLine, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

type ScanResult = "idle" | "scanning" | "valid" | "used" | "invalid";

interface TicketInfo {
  id: string;
  qr_code: string;
  eventTitle: string;
  userName: string | null;
}

const AdminScan = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult>("idle");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [qrInput, setQrInput] = useState("");

  const resetScan = () => {
    setResult("idle");
    setTicketInfo(null);
    setQrInput("");
  };

  const handleScan = async (qrCode: string) => {
    if (!qrCode.trim()) return;
    setResult("scanning");

    try {
      // Look up the ticket by QR code
      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("id, qr_code, status, event_id, user_id")
        .eq("qr_code", qrCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (!ticket) {
        setResult("invalid");
        setTimeout(resetScan, 4000);
        return;
      }

      // Fetch event title
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", ticket.event_id)
        .single();

      // Fetch attendee name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", ticket.user_id)
        .single();

      const info: TicketInfo = {
        id: ticket.id,
        qr_code: ticket.qr_code,
        eventTitle: event?.title || "Unknown Event",
        userName: profile?.name || null,
      };
      setTicketInfo(info);

      if (ticket.status === "used") {
        setResult("used");
        setTimeout(resetScan, 4000);
        return;
      }

      if (ticket.status === "cancelled") {
        setResult("invalid");
        setTimeout(resetScan, 4000);
        return;
      }

      // Mark as used + set checkin_time
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: "used", checkin_time: new Date().toISOString() })
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      setResult("valid");
      setTimeout(resetScan, 4000);
    } catch (err) {
      console.error("Scan error:", err);
      setResult("invalid");
      setTimeout(resetScan, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 px-5 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Ticket Scanner</h1>
      </div>

      {/* Scanner viewport */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {(result === "idle" || result === "scanning") && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full max-w-xs"
            >
              <div className="w-64 h-64 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-6 relative">
                {result === "scanning" ? (
                  <Loader2 size={48} className="text-primary animate-spin" />
                ) : (
                  <ScanLine size={80} className="text-muted-foreground/30" />
                )}
                <div className="absolute inset-4 border-2 border-primary/30 rounded-xl" />
              </div>
              <p className="text-sm font-mono text-muted-foreground text-center mb-6">
                Enter QR code to validate
              </p>

              {/* Manual QR input for demo */}
              <div className="w-full space-y-3">
                <Input
                  placeholder="Paste QR code (e.g. TKT-...)"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan(qrInput)}
                  className="font-mono text-sm"
                  disabled={result === "scanning"}
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleScan(qrInput)}
                  disabled={result === "scanning" || !qrInput.trim()}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm disabled:opacity-50"
                >
                  {result === "scanning" ? "Checking..." : "Validate Ticket"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {result === "valid" && (
            <motion.div
              key="valid"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle size={64} className="text-success" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-success mb-1">Valid Ticket</h2>
              <p className="text-sm font-mono text-muted-foreground mb-1">Entry granted ✓</p>
              {ticketInfo && (
                <div className="mt-3 text-center space-y-1">
                  <p className="text-sm font-heading font-semibold text-foreground">{ticketInfo.eventTitle}</p>
                  {ticketInfo.userName && (
                    <p className="text-xs font-mono text-muted-foreground">{ticketInfo.userName}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {result === "used" && (
            <motion.div
              key="used"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle size={64} className="text-destructive" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-destructive mb-1">Already Used</h2>
              <p className="text-sm font-mono text-muted-foreground">This ticket was already scanned</p>
              {ticketInfo && (
                <div className="mt-3 text-center space-y-1">
                  <p className="text-sm font-heading font-semibold text-foreground">{ticketInfo.eventTitle}</p>
                  {ticketInfo.userName && (
                    <p className="text-xs font-mono text-muted-foreground">{ticketInfo.userName}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {result === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle size={64} className="text-destructive" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-destructive mb-1">Invalid Ticket</h2>
              <p className="text-sm font-mono text-muted-foreground">This ticket is not recognized</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminScan;
