import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Ticket, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { resolveEventLink } from "@/utils/resolveEventLink";
import { getEventDisplayImage, resolveCategory, CATEGORY_GRADIENTS } from "@/utils/eventFallbackImage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditEventDialog } from "./EditEventDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventCardProps {
  event: any;
  onRefresh: () => void;
}

export function EventCard({ event, onRefresh }: EventCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Event deleted");
      setDeleteOpen(false);
      onRefresh();
    }
  };

  const handleQuickRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) toast.error("Failed to remove");
    else { toast.success("Event removed"); onRefresh(); }
  };

  const { href, isExternal } = resolveEventLink(event);

  const displayImage = getEventDisplayImage(event);
  const isFallback = !event.image_url;
  const category = resolveCategory(event.event_type);
  const gradient = CATEGORY_GRADIENTS[category];

  const imageSection = (
    <div className="h-40 overflow-hidden relative">
      <img src={displayImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      {isFallback && <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />}
      {isFallback && <Badge variant="outline" className="absolute top-2 left-2 text-[10px] bg-background/80">Fallback</Badge>}
      {event.event_type && <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px]">{event.event_type}</Badge>}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditOpen(true); }}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="destructive" className="h-7 w-7" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80" onClick={handleQuickRemove} title="Quick remove">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const cardContent = (
    <>
      {imageSection}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex items-center gap-1.5">
          {event.title}
          {isExternal && <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </h3>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {event.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>}
          {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>}
        </div>
        {event.venue_name && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.venue_name}</span>
            {event.cities && (
              <>
                <span className="text-border">—</span>
                <span>{(event.cities as any).name}</span>
              </>
            )}
          </div>
        )}
        {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {event.ticket_price && <Badge variant="secondary" className="text-xs font-mono"><Ticket className="h-3 w-3 mr-1" />{event.ticket_price}</Badge>}
            {event.cities && <Badge variant="outline" className="text-xs">{(event.cities as any).name}</Badge>}
          </div>
          {event.organizers && <span className="text-xs text-muted-foreground">{(event.organizers as any).name}</span>}
        </div>
      </div>
    </>
  );

  const cardClass = "bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group block";

  return (
    <>
      {isExternal ? (
        <a key={event.id} href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>{cardContent}</a>
      ) : (
        <Link key={event.id} to={href} className={cardClass}>{cardContent}</Link>
      )}
      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} onSaved={onRefresh} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{event.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
