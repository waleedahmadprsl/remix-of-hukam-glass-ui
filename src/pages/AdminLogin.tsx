import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data && data.user) {
        // verify role
        const { data: profile, error: profileError } = await (supabase as any)
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profileError) {
          setError("Unable to verify role");
          await supabase.auth.signOut();
        } else if (!profile || !["owner", "manager"].includes(profile.role)) {
          setError("Access denied");
          await supabase.auth.signOut();
        } else {
          navigate("/admin");
        }
      } else {
        setError("Unknown login error");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-3xl w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            HUK<span className="text-brand-blue">A</span>M Admin
          </h1>
          <p className="text-muted-foreground">Founder Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@hukam.pk"
              className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/40 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-70"
          >
            {loading ? "Logging in..." : "HUKAM Login"}
          </motion.button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Only authorized founders can access this panel.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
