import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" });

      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact" });

      setStats({
        totalOrders: orderCount || 0,
        totalProducts: productCount || 0,
        totalRevenue: 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <AdminLayout activeTab="dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-xl text-center"
          >
            <p className="text-muted-foreground text-sm">Total Orders</p>
            <h2 className="text-4xl font-bold text-foreground mt-2">{stats.totalOrders}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-xl text-center"
          >
            <p className="text-muted-foreground text-sm">Total Products</p>
            <h2 className="text-4xl font-bold text-foreground mt-2">{stats.totalProducts}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-xl text-center"
          >
            <p className="text-muted-foreground text-sm">Total Revenue</p>
            <h2 className="text-4xl font-bold text-brand-blue mt-2">Rs.{stats.totalRevenue}</h2>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
