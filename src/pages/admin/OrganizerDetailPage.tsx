import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, Globe, Calendar, Clock, Mail, Search,
  Loader2, ExternalLink, Instagram, MapPin, Send,
} from "lucide-react";
import { toast } from "sonner";

export default function OrganizerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: organizer, isLoading: loadingOrg } = useQuery({
    queryKey: ["organizer-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizers")
        .select("*, cities(id, name, country)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["organizer-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(id, name, country)")
        .eq("organizer_id", id!)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const discoverEmailMutation = useMutation({
    mutationFn: async () => {
      if (!organizer?.website) throw new Error("No website URL available for this organizer");
      const { data, error } = await supabase.functions.invoke("discover-organizer-email", {
        body: { website: organizer.website, organizer_name: organizer.name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data.best_email) {
        await supabase.from("organizers").update({ email: data.best_email }).eq("id", id!);
        queryClient.invalidateQueries({ queryKey: ["organizer-detail", id] });
        toast.success(`Email discovered: ${data.best_email}`);
      } else {
        toast.info(`No emails found. Scanned ${data.pages_scanned?.length ?? 0} pages.`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const isLoading = loadingOrg || loadingEvents;

  const firstEvent = events?.length ? events[events.length - 1] : null;
  const lastEvent = events?.length ? events[0] : null;

  const statusColor: Record<string, string> = {
    not_contacted: "bg-muted text-muted-foreground",
    contacted: "bg-blue-500/15 text-blue-400",
    replied: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-destructive/15 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/admin/organizers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Organizers
        </Link>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading organizer...</div>
        ) : !organizer ? (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-2xl font-bold">Organizer not available</h2>
            <p className="text-muted-foreground">This organizer may have been removed.</p>
            <Button asChild variant="outline">
              <Link to="/admin/organizers">Return to Organizers</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold">{organizer.name}</h1>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {organizer.cities && (
                    <Link to={`/admin/cities/${(organizer.cities as any).name.toLowerCase()}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MapPin className="h-3 w-3" />
                      {(organizer.cities as any).name}, {(organizer.cities as any).country}
                    </Link>
                  )}
                  {!organizer.cities && organizer.country && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{organizer.country}</span>
                  )}
                </div>
              </div>
              <Badge className={statusColor[organizer.contact_status] || "bg-muted text-muted-foreground"}>
                {organizer.contact_status.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{events?.length ?? 0}</div>
                <div className="text-xs text-muted-foreground">Events</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium truncate">{firstEvent?.date ?? "—"}</div>
                <div className="text-xs text-muted-foreground">First Event</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium truncate">{lastEvent?.date ?? "—"}</div>
                <div className="text-xs text-muted-foreground">Latest Event</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium truncate">{organizer.permission_status}</div>
                <div className="text-xs text-muted-foreground">Permission</div>
              </div>
            </div>

            {/* Contact Intelligence */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Intelligence
                </h2>
                {organizer.website && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => discoverEmailMutation.mutate()}
                    disabled={discoverEmailMutation.isPending}
                  >
                    {discoverEmailMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Discover Email
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <ContactField label="Email" value={organizer.email} icon={<Mail className="h-4 w-4" />} isEmail />
                <ContactField label="Website" value={organizer.website} icon={<Globe className="h-4 w-4" />} isLink />
                <ContactField label="Instagram" value={organizer.instagram ? `https://instagram.com/${organizer.instagram.replace("@", "")}` : undefined} displayValue={organizer.instagram ? `@${organizer.instagram.replace("@", "")}` : undefined} icon={<Instagram className="h-4 w-4" />} isLink />
                <ContactField label="Facebook" value={(organizer as any).facebook} icon={<Globe className="h-4 w-4" />} isLink />
                <ContactField label="LinkedIn" value={(organizer as any).linkedin} icon={<Globe className="h-4 w-4" />} isLink />
                <ContactField label="Contact Page" value={(organizer as any).contact_page} icon={<ExternalLink className="h-4 w-4" />} isLink />
              </div>

              {organizer.email && (
                <Button
                  size="sm"
                  onClick={() => navigate("/admin/outreach")}
                  className="mt-2"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Outreach Email
                </Button>
              )}
            </div>

            {/* Events */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Events by {organizer.name} ({events?.length ?? 0})</h2>
              {!events?.length ? (
                <p className="text-muted-foreground text-sm">No events found for this organizer.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      to={`/admin/events/${event.id}`}
                      className="flex gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
                    >
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 text-muted-foreground">🎵</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{event.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          {event.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>}
                          {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>}
                        </div>
                        {event.venue_name && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{event.venue_name}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ContactField({
  label,
  value,
  displayValue,
  icon,
  isLink,
  isEmail,
}: {
  label: string;
  value?: string | null;
  displayValue?: string;
  icon: React.ReactNode;
  isLink?: boolean;
  isEmail?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        {value ? (
          isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
              {displayValue || value}
            </a>
          ) : isEmail ? (
            <a href={`mailto:${value}`} className="text-sm text-primary hover:underline truncate block">
              {value}
            </a>
          ) : (
            <span className="text-sm truncate block">{displayValue || value}</span>
          )
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">Not discovered</span>
        )}
      </div>
    </div>
  );
}
