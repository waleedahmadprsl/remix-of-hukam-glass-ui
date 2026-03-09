import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminResetPassword: React.FC = () => {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 rounded-3xl w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-display">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-green-600 font-semibold">Password updated successfully!</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10" />
            </div>
            {error && <div className="p-3 bg-destructive/10 border border-destructive/40 rounded-lg text-sm text-destructive">{error}</div>}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-70">
              {loading ? "Updating..." : "Set New Password"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
