import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type SourceType = Database["public"]["Enums"]["source_type"];
type CrawlFreq = Database["public"]["Enums"]["crawl_frequency"];

export default function SourcesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [cityId, setCityId] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("other");
  const [freq, setFreq] = useState<CrawlFreq>("daily");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filters
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCityId, setFilterCityId] = useState("");

  const { data: sources, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sources").select("*, cities(name, country)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("id, name, country").order("name");
      if (error) throw error;
      return data;
    },
  });

  const countries = cities ? [...new Set(cities.map((c) => c.country))].sort() : [];
  const filterCities = filterCountry && filterCountry !== "all"
    ? cities?.filter((c) => c.country === filterCountry)
    : cities;

  const filteredSources = sources?.filter((s) => {
    const city = s.cities as any;
    if (filterCountry && filterCountry !== "all" && city?.country !== filterCountry) return false;
    if (filterCityId && filterCityId !== "all" && s.city_id !== filterCityId) return false;
    return true;
  });

  const allFilteredIds = filteredSources?.map((s) => s.id) ?? [];
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allFilteredIds));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addSource = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sources").insert({
        name, url, city_id: cityId, source_type: sourceType, crawl_frequency: freq,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
      toast.success("Source added");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleApproval = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("sources").update({ approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }),
  });

  const bulkApproval = useMutation({
    mutationFn: async (approved: boolean) => {
      const ids = Array.from(selected);
      const { error } = await supabase.from("sources").update({ approved }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setSelected(new Set());
      toast.success("Sources updated");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sources</h2>
            <p className="text-muted-foreground text-sm mt-1">Event data sources</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Source</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Source</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Source name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                <Select value={cityId} onValueChange={setCityId}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {cities?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.source_type.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={freq} onValueChange={(v) => setFreq(v as CrawlFreq)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.crawl_frequency.map((f) => (
                      <SelectItem key={f} value={f}>{f.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={() => addSource.mutate()} disabled={!name || !url || !cityId}>
                  Add Source
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setFilterCityId(""); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCityId} onValueChange={setFilterCityId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {filterCities?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            <span className="text-sm text-muted-foreground">
              {selected.size > 0 ? `${selected.size} selected` : `${filteredSources?.length ?? 0} sources`}
            </span>
            {selected.size > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={() => bulkApproval.mutate(true)}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => bulkApproval.mutate(false)}>Set Pending</Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : !filteredSources?.length ? (
            <div className="p-8 text-center text-muted-foreground">No sources found</div>
          ) : (
            filteredSources.map((source) => (
              <div key={source.id} className="p-4 flex items-center gap-3">
                <Checkbox checked={selected.has(source.id)} onCheckedChange={() => toggleOne(source.id)} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{source.source_type.replace("_", " ")}</Badge>
                    {source.cities && <Badge variant="secondary" className="text-xs">{(source.cities as any).name}</Badge>}
                    {(source.cities as any)?.country && <Badge variant="secondary" className="text-xs">{(source.cities as any).country}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{source.approved ? "Approved" : "Pending"}</span>
                  <Switch
                    checked={source.approved}
                    onCheckedChange={(approved) => toggleApproval.mutate({ id: source.id, approved })}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
