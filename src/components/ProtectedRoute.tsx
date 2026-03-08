import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  const [checkingRole, setCheckingRole] = React.useState(true);

  React.useEffect(() => {
    if (!session) {
      setCheckingRole(false);
      return;
    }
    const fetchRole = async () => {
      try {
        const { data } = await (supabase as any)
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (data?.role) setRole(data.role);
      } catch {
        // ignore
      } finally {
        setCheckingRole(false);
      }
    };
    fetchRole();
  }, [session]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{loading ? "Loading..." : "Checking permissions..."}</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  if (role && !["owner", "manager"].includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-xl">Access Denied</p>
      </div>
    );
  }

  return <>{children}</>;
};
