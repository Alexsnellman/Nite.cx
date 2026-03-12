import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2, Search, Globe, Play, ListChecks, Tags } from "lucide-react";
import { toast } from "sonner";
import { ExtractedEventCard } from "@/components/extract/ExtractedEventCard";
import { DiscoveredSourcesList } from "@/components/extract/DiscoveredSourcesList";
import { ExtractionDiagnosticsPanel, type ExtractionDiagnostics } from "@/components/extract/ExtractionDiagnosticsPanel";
import { ExtractionJobsDashboard } from "@/components/extract/ExtractionJobsDashboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ExtractedEvent {
  title: string;
  description?: string;
  date?: string;
  time?: string;
  venue_name?: string;
  venue_address?: string;
  city?: string;
  ticket_price?: string;
  ticket_url?: string;
  event_url?: string;
  image_url?: string;
  source_url?: string;
  organizer_name?: string;
  organizer_website?: string;
  organizer_email?: string;
  organizer_instagram?: string;
  event_type?: string;
}

export interface DiscoveredSource {
  name: string;
  url: string;
  source_type: string;
  city?: string;
  country: string;
  crawl_frequency?: string;
}

export default function ExtractPage() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [cityId, setCityId] = useState("");
  const [extracted, setExtracted] = useState<ExtractedEvent[] | null>(null);
  const [singleDiagnostics, setSingleDiagnostics] = useState<ExtractionDiagnostics | null>(null);

  // Discovery state
  const [discoverCountry, setDiscoverCountry] = useState("");
  const [discoverCity, setDiscoverCity] = useState("");
  const [discovered, setDiscovered] = useState<DiscoveredSource[] | null>(null);

  // Batch extraction state
  const [batchCountry, setBatchCountry] = useState("");
  const [batchCityId, setBatchCityId] = useState("");
  const [useDeepExtract, setUseDeepExtract] = useState(true);

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("id, name, country").order("name");
      if (error) throw error;
      return data;
    },
  });

  const countries = cities ? [...new Set(cities.map((c) => c.country))].sort() : [];
  const filteredCities = batchCountry
    ? cities?.filter((c) => c.country === batchCountry)
    : cities;

  // Source Discovery
  const discoverMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("discover-sources", {
        body: { country: discoverCountry, city: discoverCity || undefined },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setDiscovered(data.sources ?? []);
      toast[data.sources?.length ? "success" : "info"](
        data.sources?.length ? `Discovered ${data.sources.length} sources` : "No sources found"
      );
    },
    onError: (e) => toast.error(e.message),
  });

  const saveSourcesMutation = useMutation({
    mutationFn: async () => {
      if (!discovered?.length || !cityId) return;
      const rows = discovered.map((s) => ({
        name: s.name,
        url: s.url,
        source_type: s.source_type as any,
        city_id: cityId,
        crawl_frequency: (s.crawl_frequency || "daily") as any,
        approved: false,
      }));
      const { error } = await supabase.from("sources").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDiscovered(null);
      toast.success("Sources saved to database");
    },
    onError: (e) => toast.error(e.message),
  });

  // Single URL extraction
  const extractMutation = useMutation({
    mutationFn: async () => {
      const fnName = useDeepExtract ? "deep-extract" : "extract-events";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { url },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setExtracted(data.events ?? []);
      if (data.diagnostics) setSingleDiagnostics(data.diagnostics);
      toast[data.events?.length ? "success" : "info"](
        data.events?.length ? `Extracted ${data.events.length} events` : "No events found on this page"
      );
    },
    onError: (e) => toast.error(e.message),
  });

  // Background batch extraction — creates a job and fires the worker
  const batchExtractMutation = useMutation({
    mutationFn: async () => {
      const selectedCity = batchCityId && batchCityId !== "all"
        ? cities?.find((c) => c.id === batchCityId)
        : null;

      // Create job row
      const { data: job, error: jobErr } = await supabase
        .from("extraction_jobs")
        .insert({
          country: batchCountry || null,
          city_id: selectedCity?.id || null,
          city_name: selectedCity?.name || null,
          use_deep_extract: useDeepExtract,
          status: "queued" as any,
        })
        .select("id")
        .single();

      if (jobErr || !job) throw new Error(jobErr?.message || "Failed to create job");

      // Fire the background worker (don't await — it runs independently)
      supabase.functions.invoke("run-extraction-job", {
        body: { job_id: job.id },
      }).catch((e) => console.error("Worker invocation failed:", e));

      return job.id;
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ["extraction-jobs"] });
      toast.success("Extraction job started! You can navigate away — it runs in the background.");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (events: ExtractedEvent[]) => {
      if (!events.length) return;

      const cityNames = [...new Set(events.map((ev) => ev.city?.trim()).filter(Boolean))] as string[];
      const { data: existingCities } = await supabase.from("cities").select("id, name");
      const cityMap: Record<string, string> = {};
      for (const c of existingCities ?? []) {
        cityMap[c.name.toLowerCase()] = c.id;
      }

      for (const name of cityNames) {
        if (!cityMap[name.toLowerCase()]) {
          const { data: created } = await supabase
            .from("cities")
            .insert({ name, country: "Finland" })
            .select("id")
            .single();
          if (created) cityMap[name.toLowerCase()] = created.id;
        }
      }

      const today = new Date().toISOString().split("T")[0];
      const futureEvents = events.filter((ev) => !ev.date || ev.date >= today);

      const eventUrls = futureEvents.map((ev) => ev.event_url).filter(Boolean) as string[];
      const existingUrls = new Set<string>();
      if (eventUrls.length > 0) {
        const { data: existing } = await supabase
          .from("events")
          .select("event_url")
          .in("event_url", eventUrls);
        if (existing) {
          for (const row of existing) {
            if (row.event_url) existingUrls.add(row.event_url);
          }
        }
      }
      const newEvents = futureEvents.filter((ev) => !ev.event_url || !existingUrls.has(ev.event_url));

      if (!newEvents.length) {
        toast.info("All events already exist or are in the past");
        return;
      }

      const rows = newEvents.map((ev) => {
        const resolvedCityId = ev.city ? (cityMap[ev.city.toLowerCase().trim()] || cityId || null) : (cityId || null);
        return {
          title: ev.title,
          description: ev.description || null,
          date: ev.date || null,
          time: ev.time || null,
          venue_name: ev.venue_name || null,
          venue_address: ev.venue_address || null,
          ticket_price: ev.ticket_price || null,
          ticket_url: ev.ticket_url || null,
          image_url: ev.image_url || null,
          source_url: ev.source_url || url,
          city_id: resolvedCityId,
          event_type: ev.event_type || null,
          event_url: ev.event_url || ev.ticket_url || null,
        };
      });
      const { error } = await supabase.from("events").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setExtracted(null);
      setUrl("");
      toast.success("Events saved to database");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Intelligence</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Discover sources and extract events using AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="deep-mode" checked={useDeepExtract} onCheckedChange={setUseDeepExtract} />
            <Label htmlFor="deep-mode" className="text-sm cursor-pointer">Deep Extract</Label>
          </div>
        </div>

        {/* Source Discovery */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Automatic Source Discovery</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            AI discovers nightlife event sources for a country or city
          </p>
          <div className="flex gap-3">
            <Input placeholder="Country (e.g. Finland)" value={discoverCountry} onChange={(e) => setDiscoverCountry(e.target.value)} className="flex-1" />
            <Input placeholder="City (optional)" value={discoverCity} onChange={(e) => setDiscoverCity(e.target.value)} className="flex-1" />
            <Button onClick={() => discoverMutation.mutate()} disabled={!discoverCountry || discoverMutation.isPending}>
              {discoverMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Discover
            </Button>
          </div>
          {discovered && discovered.length > 0 && (
            <DiscoveredSourcesList
              discovered={discovered}
              cities={cities ?? []}
              cityId={cityId}
              setCityId={setCityId}
              onSave={() => saveSourcesMutation.mutate()}
              isSaving={saveSourcesMutation.isPending}
            />
          )}
        </div>

        {/* Batch Event Extraction — now background jobs */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Batch Event Extraction</h3>
            {useDeepExtract && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">DEEP</span>}
            <span className="text-[10px] bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded font-medium">BACKGROUND</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Extract events from all approved sources — runs in the background, you can navigate away
          </p>
          <div className="flex gap-3">
            <Select value={batchCountry} onValueChange={(v) => { setBatchCountry(v); setBatchCityId(""); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={batchCityId} onValueChange={setBatchCityId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {filteredCities?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => batchExtractMutation.mutate()}
              disabled={!batchCountry || batchExtractMutation.isPending}
            >
              {batchExtractMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Start Extraction
           </Button>
          </div>
        </div>

        {/* AI Categorization */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Event Categorization</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Classify uncategorized events into categories (nightlife, concert, festival, art, etc.) for visual enrichment
          </p>
          <Button
            onClick={async () => {
              toast.info("Categorizing events...");
              const { data, error } = await supabase.functions.invoke("categorize-events", { body: { limit: 100 } });
              if (error) toast.error(error.message);
              else toast.success(`Categorized ${data?.categorized ?? 0} events`);
            }}
            variant="outline"
          >
            <Tags className="h-4 w-4 mr-2" /> Categorize Uncategorized Events
          </Button>
        </div>

        {/* Extraction Jobs Dashboard */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Extraction Jobs</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Live progress of background extraction jobs — updates every 5 seconds
          </p>
          <ExtractionJobsDashboard />
        </div>

        {/* Single URL Extraction */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Single URL Extraction</h3>
            {useDeepExtract && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">DEEP</span>}
          </div>
          <p className="text-sm text-muted-foreground">
            Paste an event page URL and extract event data using AI
          </p>
          <div className="flex gap-3">
            <Input placeholder="https://example.com/events" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Button onClick={() => extractMutation.mutate()} disabled={!url || extractMutation.isPending}>
              {extractMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Extract
            </Button>
          </div>

          {singleDiagnostics && (
            <ExtractionDiagnosticsPanel diagnostics={[singleDiagnostics]} />
          )}

          {extracted && extracted.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Extracted Events ({extracted.length})</h4>
                <div className="flex items-center gap-3">
                  <Select value={cityId} onValueChange={setCityId}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => saveMutation.mutate(extracted)} disabled={!cityId || saveMutation.isPending} size="sm">
                    Save All
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border border border-border rounded-lg">
                {extracted.map((ev, i) => (
                  <ExtractedEventCard key={i} event={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
