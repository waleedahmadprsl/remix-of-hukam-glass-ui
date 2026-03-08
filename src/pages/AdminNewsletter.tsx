import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Mail, Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch subscribers", variant: "destructive" });
    }
    setSubscribers(data || []);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const csv = ["Email,Subscribed Date", ...subscribers.map((s) => `${s.email},${new Date(s.created_at).toLocaleDateString()}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hukam-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${subscribers.length} emails exported to CSV.` });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Removed", description: "Subscriber removed." });
    }
  };

  return (
    <AdminLayout activeTab="newsletter">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground font-display">Newsletter Subscribers</h1>
            <p className="text-sm text-muted-foreground mt-1">{subscribers.length} total subscribers</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Subscribers Yet</h3>
            <p className="text-sm text-muted-foreground">When customers subscribe to your newsletter, they'll appear here.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground text-xs border-b border-border/30">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, i) => (
                    <tr key={sub.id} className="border-t border-border/20 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{sub.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
