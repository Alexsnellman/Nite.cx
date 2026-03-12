import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type EventVisibility = Database["public"]["Enums"]["event_visibility"];

const visibilityOptions: { label: string; value: EventVisibility }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Student Only", value: "student_only" },
  { label: "Invite Only", value: "invite_only" },
];

const CITY = "Helsinki";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [studentEvent, setStudentEvent] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setMediaFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaPreviews((prev) => [...prev, url]);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (mediaFiles.length === 0 || !user) return null;
    const file = mediaFiles[0];
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("event-media")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: urlData } = supabase.storage.from("event-media").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", " + CITY)}&limit=1`,
        { headers: { "User-Agent": "LovableApp/1.0" } }
      );
      const results = await res.json();
      if (results.length > 0) {
        return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create an event.");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadMedia();
      const coords = await geocodeAddress(location);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase.from("events").insert({
        title,
        location,
        city: CITY,
        date,
        time,
        ticket_price: parseFloat(ticketPrice) || 0,
        capacity: parseInt(capacity) || 100,
        genre: genre || null,
        description: description || null,
        visibility,
        organizer_id: user.id,
        organizer_name: profile?.name || user.email?.split("@")[0] || "Organizer",
        image_url: imageUrl,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        student_event: studentEvent,
      } as any);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });

      toast.success("Event created successfully!");
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Event Created!</h2>
          <p className="text-sm font-mono text-muted-foreground mb-6">Your event is now live in {CITY}.</p>
          <button
            onClick={() => navigate("/feed")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-heading font-bold text-sm"
          >
            Back to Feed
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-2xl font-heading font-bold text-foreground">Create Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {mediaPreviews.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-card rounded-xl border border-dashed border-border p-8 flex flex-col items-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-mono text-muted-foreground">Upload video or images</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mediaPreviews.map((src, i) => (
                <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center text-xs text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center bg-card"
              >
                <Upload size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Event Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
        />

        <input
          type="text"
          placeholder={`Location in ${CITY}`}
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-card rounded-xl px-4 py-3.5 text-foreground font-mono text-sm border-none outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-card rounded-xl px-4 py-3.5 text-foreground font-mono text-sm border-none outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Ticket Price (€)"
            min="0"
            required
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            className="bg-card rounded-xl px-4 py-3.5 text-foreground font-mono text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Capacity"
            min="1"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="bg-card rounded-xl px-4 py-3.5 text-foreground font-mono text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <input
          type="text"
          placeholder="Music Style"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
        />

        <textarea
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        {/* Student event toggle */}
        <div
          onClick={() => setStudentEvent(!studentEvent)}
          className="flex items-center justify-between px-4 py-3.5 bg-card rounded-xl cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="text-sm font-heading font-semibold text-foreground">Student Event</span>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
            studentEvent ? "bg-primary" : "bg-muted"
          }`}>
            <div className={`w-5 h-5 rounded-full bg-background transition-transform ${
              studentEvent ? "translate-x-4" : "translate-x-0"
            }`} />
          </div>
        </div>

        {/* Visibility options */}
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Visibility
          </p>
          <div className="flex gap-2 flex-wrap">
            {visibilityOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={visibility === opt.value}
                  onChange={() => setVisibility(opt.value)}
                  className="accent-primary"
                />
                <span className="text-xs font-mono text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              CREATING...
            </>
          ) : (
            "CREATE EVENT"
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default CreateEvent;
