import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2, Sparkles, Send, Save, UserPlus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function OutreachPage() {
  const queryClient = useQueryClient();

  // Campaign fields
  const [campaignName, setCampaignName] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("not_contacted");

  // Recipients
  const [recipientCountry, setRecipientCountry] = useState("");
  const [recipientCityId, setRecipientCityId] = useState("");

  // AI fields
  const [goal, setGoal] = useState("Offer free event promotion on Nite");
  const [tone, setTone] = useState("friendly");
  const [offer, setOffer] = useState("Free promotion for nightlife events");
  const [signature, setSignature] = useState("Nite Team");

  // Generated email
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Editing saved campaign
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("id, name, country").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["outreach-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaigns")
        .select("*, cities(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Split campaigns into saved (not sent) and sent
  const savedCampaigns = campaigns?.filter((c) => !c.sent_at) ?? [];
  const sentCampaigns = campaigns?.filter((c) => c.sent_at) ?? [];

  // Count matching organizers for recipients
  const { data: matchCount } = useQuery({
    queryKey: ["outreach-match", recipientCountry, recipientCityId, statusFilter],
    queryFn: async () => {
      let q = supabase.from("organizers").select("id", { count: "exact", head: true });
      if (recipientCountry && recipientCountry !== "all") q = q.eq("country", recipientCountry);
      if (recipientCityId && recipientCityId !== "all") q = q.eq("city_id", recipientCityId);
      if (statusFilter) q = q.eq("contact_status", statusFilter as any);
      const { count, error } = await q;
      if (error) return 0;
      return count ?? 0;
    },
  });

  const uniqueCountries = [...new Set(cities?.map((c) => c.country) || [])].sort();
  const filteredCities = recipientCountry && recipientCountry !== "all"
    ? cities?.filter((c) => c.country === recipientCountry)
    : cities;

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-outreach", {
        body: { goal, tone, offer, signature },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setEmailSubject(data.email?.subject || "");
      setEmailBody(data.email?.body || "");
      setShowPreview(true);
      toast.success("Email generated");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveCampaignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("outreach_campaigns").insert({
        name: campaignName || "Untitled Campaign",
        country_filter: recipientCountry && recipientCountry !== "all" ? recipientCountry : null,
        city_filter: recipientCityId && recipientCityId !== "all" ? recipientCityId : null,
        status_filter: statusFilter as any,
        goal,
        tone,
        offer,
        signature,
        email_subject: emailSubject,
        email_body: emailBody,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaigns"] });
      setShowPreview(false);
      setEmailSubject("");
      setEmailBody("");
      setCampaignName("");
      toast.success("Campaign saved — edit it below before sending");
    },
    onError: (e) => toast.error(e.message),
  });

  // Update saved campaign email
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, subject, body }: { id: string; subject: string; body: string }) => {
      const { error } = await supabase
        .from("outreach_campaigns")
        .update({ email_subject: subject, email_body: body })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaigns"] });
      setEditingId(null);
      toast.success("Campaign updated");
    },
    onError: (e) => toast.error(e.message),
  });

  // Send campaign (marks as sent)
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      // Mark campaign as sent
      const { error } = await supabase
        .from("outreach_campaigns")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", campaignId);
      if (error) throw error;

      // Update matching organizers to "contacted"
      const campaign = campaigns?.find((c) => c.id === campaignId);
      if (campaign) {
        let q = supabase.from("organizers").update({ contact_status: "contacted" as any });
        if (campaign.country_filter) q = q.eq("country", campaign.country_filter);
        if (campaign.city_filter) q = q.eq("city_id", campaign.city_filter);
        if (campaign.status_filter) q = q.eq("contact_status", campaign.status_filter as any);
        await q;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Campaign sent — organizers marked as contacted");
    },
    onError: (e) => toast.error(e.message),
  });

  const startEditing = (c: any) => {
    setEditingId(c.id);
    setEditSubject(c.email_subject || "");
    setEditBody(c.email_body || "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Outreach</h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered organizer outreach campaigns
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Campaign Setup */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Campaign Setup</h3>
            </div>

            <Input
              placeholder="Campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />

            {/* Add Recipients */}
            <div className="space-y-2 p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserPlus className="h-4 w-4 text-primary" />
                Add Recipients
              </div>
              <Select value={recipientCountry} onValueChange={(v) => { setRecipientCountry(v); setRecipientCityId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {uniqueCountries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={recipientCityId} onValueChange={setRecipientCityId}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {filteredCities?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Contact status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_contacted">Not Contacted</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="p-2 bg-secondary rounded text-sm">
                <span className="text-muted-foreground">Matching recipients: </span>
                <span className="font-bold text-primary">{matchCount ?? 0}</span>
              </div>
            </div>
          </div>

          {/* AI Email Generator */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">AI Email Generator</h3>
            </div>

            <Input placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Offer" value={offer} onChange={(e) => setOffer(e.target.value)} />
            <Input placeholder="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} />

            <Button
              className="w-full"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Email
            </Button>
          </div>
        </div>

        {/* Generated Email Preview — disappears on save */}
        {showPreview && (emailSubject || emailBody) && (
          <div className="bg-card border border-primary/30 rounded-xl p-6 space-y-4 glow-primary">
            <h3 className="font-semibold">Email Preview</h3>
            <div className="space-y-3">
              <Input
                placeholder="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <Textarea
                placeholder="Email body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
              />
            </div>
            <Button onClick={() => saveCampaignMutation.mutate()} disabled={saveCampaignMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Campaign
            </Button>
          </div>
        )}

        {/* Saved Campaigns (not sent yet — editable) */}
        {savedCampaigns.length > 0 && (
          <div className="bg-card border border-border rounded-xl">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold">Saved Campaigns</h3>
              <p className="text-xs text-muted-foreground mt-1">Edit email content, then send when ready</p>
            </div>
            <div className="divide-y divide-border">
              {savedCampaigns.map((c) => (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.name}</p>
                      <Badge variant="outline" className="text-xs">Draft</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 text-xs">
                    {c.country_filter && (
                      <span className="bg-secondary px-2 py-0.5 rounded">{c.country_filter}</span>
                    )}
                    {c.cities && (
                      <span className="bg-secondary px-2 py-0.5 rounded">{(c.cities as any).name}</span>
                    )}
                  </div>

                  {editingId === c.id ? (
                    <div className="space-y-3 p-3 bg-secondary/30 rounded-lg border border-border">
                      <Input
                        placeholder="Subject"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                      />
                      <Textarea
                        placeholder="Email body"
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateCampaignMutation.mutate({ id: c.id, subject: editSubject, body: editBody })}
                          disabled={updateCampaignMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {c.email_subject && (
                        <p className="text-sm"><span className="text-muted-foreground">Subject:</span> {c.email_subject}</p>
                      )}
                      {c.email_body && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{c.email_body}</p>
                      )}
                    </>
                  )}

                  <div className="flex gap-2">
                    {editingId !== c.id && (
                      <Button size="sm" variant="outline" onClick={() => startEditing(c)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit Email
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => sendCampaignMutation.mutate(c.id)}
                      disabled={sendCampaignMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" /> Send Campaign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Campaigns */}
        {sentCampaigns.length > 0 && (
          <div className="bg-card border border-border rounded-xl">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold">Recent Campaigns</h3>
              <p className="text-xs text-muted-foreground mt-1">Campaigns that have been sent</p>
            </div>
            <div className="divide-y divide-border">
              {sentCampaigns.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.name}</p>
                      <Badge className="bg-success/15 text-success border-success/30 text-xs">Sent</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Sent {new Date(c.sent_at!).toLocaleDateString()}
                    </span>
                  </div>
                  {c.email_subject && (
                    <p className="text-sm text-muted-foreground mt-1">Subject: {c.email_subject}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs">
                    {c.country_filter && (
                      <span className="bg-secondary px-2 py-0.5 rounded">{c.country_filter}</span>
                    )}
                    {c.cities && (
                      <span className="bg-secondary px-2 py-0.5 rounded">{(c.cities as any).name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
