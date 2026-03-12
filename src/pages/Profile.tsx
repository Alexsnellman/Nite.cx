import { User, Settings, Plus, QrCode, ScanLine, BarChart3, Radio, LogOut, GraduationCap, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const UNIVERSITIES = [
  "Aalto University",
  "University of Helsinki",
  "Hanken School of Economics",
  "Arcada University",
  "Other",
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("university")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.university) setUniversity(data.university);
      });
  }, [user]);

  const updateUniversity = async (uni: string) => {
    if (!user) return;
    setLoading(true);
    setUniversity(uni);
    const { error } = await supabase
      .from("profiles")
      .update({ university: uni } as any)
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update university");
    } else {
      toast.success(`University set to ${uni}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center">
          <User size={28} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">
            {user?.user_metadata?.name || "Night Owl"}
          </h1>
          <p className="text-sm font-mono text-muted-foreground">{user?.email || "nightowl@email.com"}</p>
        </div>
      </div>

      {/* City badge */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <MapPin size={14} className="text-primary" />
        <span className="text-xs font-mono text-primary font-bold">Helsinki</span>
      </div>

      {/* University badge */}
      {university && (
        <div className="flex items-center gap-2 mb-6 px-1">
          <GraduationCap size={14} className="text-primary" />
          <span className="text-xs font-mono text-foreground/70">{university}</span>
        </div>
      )}

      {/* University selector */}
      {!university && (
        <div className="mb-6 bg-card rounded-xl p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Select your university
          </p>
          <div className="space-y-2">
            {UNIVERSITIES.map((uni) => (
              <button
                key={uni}
                onClick={() => updateUniversity(uni)}
                disabled={loading}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-background text-sm font-heading text-foreground hover:bg-primary/10 transition-colors"
              >
                🎓 {uni}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-card rounded-xl p-4 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">12</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Events</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">48</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Friends</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">3</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Saved</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate("/create-event")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <Plus size={20} className="text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">Create Event</span>
        </button>

        <button
          onClick={() => navigate("/organizer")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <BarChart3 size={20} className="text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">Organizer Dashboard</span>
        </button>

        <button
          onClick={() => navigate("/radar")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <Radio size={20} className="text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">Nightlife Radar</span>
        </button>

        <button
          onClick={() => navigate("/tickets")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <QrCode size={20} className="text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">My Tickets</span>
        </button>

        <button
          onClick={() => navigate("/admin-scan")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <ScanLine size={20} className="text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">Scanner (Organizer)</span>
        </button>

        {university && (
          <button
            onClick={() => setUniversity(null)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
          >
            <GraduationCap size={20} className="text-muted-foreground" />
            <span className="font-heading font-semibold text-foreground text-sm">Change University</span>
          </button>
        )}

        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
        >
          <Settings size={20} className="text-muted-foreground" />
          <span className="font-heading font-semibold text-foreground text-sm">Settings</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-xl text-left hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={20} className="text-destructive" />
          <span className="font-heading font-semibold text-destructive text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
