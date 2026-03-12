import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditEventDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditEventDialog({ event, open, onOpenChange, onSaved }: EditEventDialogProps) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venue_name: "",
    venue_address: "",
    ticket_price: "",
    image_url: "",
    event_url: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        date: event.date || "",
        time: event.time || "",
        venue_name: event.venue_name || "",
        venue_address: event.venue_address || "",
        ticket_price: event.ticket_price || "",
        image_url: event.image_url || "",
        event_url: event.event_url || "",
        description: event.description || "",
      });
    }
  }, [event]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("events")
      .update({
        title: form.title,
        date: form.date || null,
        time: form.time || null,
        venue_name: form.venue_name || null,
        venue_address: form.venue_address || null,
        ticket_price: form.ticket_price || null,
        image_url: form.image_url || null,
        event_url: form.event_url || null,
        description: form.description || null,
      })
      .eq("id", event.id);
    setSaving(false);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Event updated");
      onOpenChange(false);
      onSaved();
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
            <div><Label>Time</Label><Input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="HH:MM" /></div>
          </div>
          <div><Label>Venue</Label><Input value={form.venue_name} onChange={(e) => set("venue_name", e.target.value)} /></div>
          <div><Label>Address</Label><Input value={form.venue_address} onChange={(e) => set("venue_address", e.target.value)} /></div>
          <div><Label>Price</Label><Input value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} /></div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} /></div>
          <div><Label>Event URL</Label><Input value={form.event_url} onChange={(e) => set("event_url", e.target.value)} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
