import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, revenueRes, pendingRes] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

      setStats({
        totalOrders: ordersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalRevenue,
        pendingOrders: pendingRes.count || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Total Revenue", value: `Rs.${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Users, color: "text-orange-500" },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">{card.value}</h2>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
