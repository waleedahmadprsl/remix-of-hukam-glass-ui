import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data as ActivityLog[]) || []);
    } catch (err: any) {
      console.error("Error fetching activity logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="logs">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Activity Logs</h1>

        {loading ? (
          <div className="text-center py-12">Loading logs...</div>
        ) : (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No activity logs yet.</div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
