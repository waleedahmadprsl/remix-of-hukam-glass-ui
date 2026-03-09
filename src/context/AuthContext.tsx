import React from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  full_name: string;
  username: string;
  phone: string;
  address: string;
  city: string;
  avatar_url: string;
  role: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = async (userId: string, user?: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, username, phone, address, city, avatar_url, role")
      .eq("id", userId)
      .single();

    if (data) {
      // Merge Google metadata as fallback for empty fields
      const meta = user?.user_metadata || {};
      setProfile({
        full_name: data.full_name || meta.full_name || meta.name || "",
        username: data.username || meta.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        avatar_url: data.avatar_url || meta.avatar_url || meta.picture || "",
        role: data.role || "user",
      });
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist yet — create it from Google metadata
      const meta = user?.user_metadata || {};
      const newProfile: Omit<Profile, "role"> & { id: string; role: string } = {
        id: userId,
        full_name: meta.full_name || meta.name || "",
        username: meta.email || "",
        phone: "",
        address: "",
        city: "",
        avatar_url: meta.avatar_url || meta.picture || "",
        role: "user",
      };
      await supabase.from("profiles").upsert(newProfile);
      setProfile(newProfile);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) await fetchProfile(session.user.id, session.user);
  };

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        setTimeout(() => fetchProfile(session.user.id, session.user), 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id, session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
