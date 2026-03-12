import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Languages, Loader2, GraduationCap, Camera, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRIES = [
  { value: "FI", label: "🇫🇮 Finland" },
  { value: "SE", label: "🇸🇪 Sweden" },
  { value: "US", label: "🇺🇸 USA" },
];

const LANGUAGES = [
  { value: "en", label: "🇬🇧 English" },
  { value: "fi", label: "🇫🇮 Suomi" },
  { value: "sv", label: "🇸🇪 Svenska" },
];

const UNIVERSITIES = [
  { value: "", label: "Select university" },
  { value: "Aalto University", label: "Aalto University" },
  { value: "University of Helsinki", label: "University of Helsinki" },
  { value: "Hanken", label: "Hanken School of Economics" },
  { value: "Metropolia", label: "Metropolia UAS" },
  { value: "Haaga-Helia", label: "Haaga-Helia UAS" },
  { value: "Laurea", label: "Laurea UAS" },
  { value: "Arcada", label: "Arcada UAS" },
  { value: "Other", label: "Other" },
];

const AVATARS = ["🧑‍🎤", "🦊", "🐺", "🎭", "👻", "🤖", "🦄", "🐻‍❄️"];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [university, setUniversity] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("country, language, university, profile_photo")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCountry((data as any).country || "");
          setLanguage((data as any).language || "en");
          setUniversity((data as any).university || "");
          setProfilePhoto((data as any).profile_photo || null);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSelfie = async () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("moment-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("moment-media")
      .getPublicUrl(path);

    const photoUrl = urlData.publicUrl;
    setProfilePhoto(photoUrl);

    await supabase
      .from("profiles")
      .update({ profile_photo: photoUrl } as any)
      .eq("user_id", user.id);

    setUploading(false);
    toast.success("Profile photo updated");
  };

  const handleAvatarSelect = async (emoji: string) => {
    if (!user) return;
    setProfilePhoto(emoji);
    setShowAvatarPicker(false);

    await supabase
      .from("profiles")
      .update({ profile_photo: emoji } as any)
      .eq("user_id", user.id);

    toast.success("Avatar updated");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ country, language, university } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Photo / Avatar */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
            <User size={14} className="text-primary" />
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            {/* Current avatar display */}
            <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
              {profilePhoto && profilePhoto.startsWith("http") ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : profilePhoto ? (
                <span className="text-2xl">{profilePhoto}</span>
              ) : (
                <User size={24} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSelfie}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold"
              >
                <Camera size={14} />
                {uploading ? "Uploading..." : "Take Selfie"}
              </button>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground text-xs font-mono font-bold"
              >
                🎭 Choose Avatar
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Avatar picker */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex gap-3 flex-wrap">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAvatarSelect(emoji)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                        profilePhoto === emoji
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-card border border-border hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* University */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
            <GraduationCap size={14} className="text-primary" />
            University
          </label>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm border border-border outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            {UNIVERSITIES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
            <Globe size={14} className="text-primary" />
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm border border-border outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="" disabled>Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
            <Languages size={14} className="text-primary" />
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm border border-border outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase disabled:opacity-50"
        >
          {saving ? "SAVING..." : "SAVE SETTINGS"}
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
