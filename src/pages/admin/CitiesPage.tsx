import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type LaunchStatus = Database["public"]["Enums"]["launch_status"];
type City = Database["public"]["Tables"]["cities"]["Row"];

export default function CitiesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<LaunchStatus>("pending");

  // Edit state
  const [editCity, setEditCity] = useState<City | null>(null);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editStatus, setEditStatus] = useState<LaunchStatus>("pending");

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addCity = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cities").insert({ name, country, launch_status: status });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
      setName("");
      setCountry("");
      toast.success("City added");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateCity = useMutation({
    mutationFn: async () => {
      if (!editCity) return;
      const { error } = await supabase
        .from("cities")
        .update({ name: editName, country: editCountry, launch_status: editStatus })
        .eq("id", editCity.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setEditCity(null);
      toast.success("City updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (city: City) => {
    setEditCity(city);
    setEditName(city.name);
    setEditCountry(city.country);
    setEditStatus(city.launch_status);
  };

  const statusColor: Record<LaunchStatus, string> = {
    active: "bg-success/15 text-success border-success/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    inactive: "bg-muted text-muted-foreground border-border",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cities</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage nightlife cities</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add City</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add City</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="City name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                <Select value={status} onValueChange={(v) => setStatus(v as LaunchStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={() => addCity.mutate()} disabled={!name || !country}>
                  Add City
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : !cities?.length ? (
            <div className="p-8 text-center text-muted-foreground">No cities yet</div>
          ) : (
            cities.map((city) => (
              <div key={city.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.country}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor[city.launch_status]}>
                    {city.launch_status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(city)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCity} onOpenChange={(v) => !v && setEditCity(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit City</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="City name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input placeholder="Country" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} />
            <Select value={editStatus} onValueChange={(v) => setEditStatus(v as LaunchStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => updateCity.mutate()} disabled={!editName || !editCountry}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}