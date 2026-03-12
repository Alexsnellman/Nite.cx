import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Flame } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!country) {
      toast.error("Please select a country");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Save country & language to profile by email
    await supabase
      .from("profiles")
      .update({ country, language } as any)
      .eq("email", email);
    setLoading(false);
    toast.success("Account created! Check your email to verify.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame size={28} className="text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Night Moves</h1>
        </div>

        <h2 className="text-xl font-heading font-bold text-foreground text-center mb-1">Create account</h2>
        <p className="text-sm font-mono text-muted-foreground text-center mb-8">Join the nightlife</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm border-none outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="" disabled>Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-card rounded-xl px-4 py-3.5 text-foreground font-heading text-sm border-none outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full bg-card rounded-xl px-4 py-3.5 pr-12 text-foreground font-heading text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase disabled:opacity-50"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </motion.button>
        </form>

        <p className="text-sm font-mono text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
