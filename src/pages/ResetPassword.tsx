import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Flame, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Check if user arrived via recovery link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecoveryMode(true);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setEmailSent(true);
      toast.success("Check your email for a reset link!");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      navigate("/");
    }
  };

  // Recovery mode — set new password
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Flame size={28} className="text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Night Moves</h1>
          </div>

          <h2 className="text-xl font-heading font-bold text-foreground text-center mb-1">Set new password</h2>
          <p className="text-sm font-mono text-muted-foreground text-center mb-8">Enter your new password below</p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-xs"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm font-mono text-muted-foreground mb-6">
            We sent a reset link to <span className="text-foreground">{email}</span>
          </p>
          <Link to="/login" className="text-sm font-mono text-primary underline underline-offset-4">
            Back to login
          </Link>
        </motion.div>
      </div>
    );
  }

  // Request reset form
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame size={28} className="text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Night Moves</h1>
        </div>

        <h2 className="text-xl font-heading font-bold text-foreground text-center mb-1">Reset password</h2>
        <p className="text-sm font-mono text-muted-foreground text-center mb-8">
          Enter your email and we'll send a reset link
        </p>

        <form onSubmit={handleRequestReset} className="space-y-4">
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

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-base tracking-wider uppercase disabled:opacity-50"
          >
            {loading ? "SENDING..." : "SEND RESET LINK"}
          </motion.button>
        </form>

        <p className="text-sm font-mono text-muted-foreground text-center mt-6">
          <Link to="/login" className="text-primary font-bold">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
