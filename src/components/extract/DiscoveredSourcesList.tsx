import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DiscoveredSource } from "@/pages/ExtractPage";

interface Props {
  discovered: DiscoveredSource[];
  cities: { id: string; name: string; country: string }[];
  cityId: string;
  setCityId: (id: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function DiscoveredSourcesList({ discovered, cities, cityId, setCityId, onSave, isSaving }: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Discovered Sources ({discovered.length})</h4>
        <div className="flex items-center gap-3">
          <Select value={cityId} onValueChange={setCityId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assign city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onSave} disabled={!cityId || isSaving} size="sm">
            Save All Sources
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border border border-border rounded-lg">
        {discovered.map((s, i) => (
          <div key={i} className="p-3">
            <p className="font-medium text-sm">{s.name}</p>
            <p className="text-xs text-muted-foreground truncate">{s.url}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded">
                {s.source_type.replace(/_/g, " ")}
              </span>
              {s.city && (
                <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded">
                  {s.city}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
