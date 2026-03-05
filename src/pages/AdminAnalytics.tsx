import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: string;
  promo_code?: string;
}

const COLORS = ["hsl(213, 94%, 68%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(262, 83%, 58%)"];

const AdminAnalytics: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id, title, price, stock"),
      ]);
      setOrders((ordersRes.data as Order[]) || []);
      setProducts(productsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Daily revenue for last 14 days
  const dailyRevenue = React.useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split("T")[0]] = 0;
    }
    orders.forEach((o) => {
      const day = new Date(o.created_at).toISOString().split("T")[0];
      if (days[day] !== undefined) days[day] += Number(o.total_amount);
    });
    return Object.entries(days).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
    }));
  }, [orders]);

  // Orders by status
  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  // Daily order count
  const dailyOrders = React.useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split("T")[0]] = 0;
    }
    orders.forEach((o) => {
      const day = new Date(o.created_at).toISOString().split("T")[0];
      if (days[day] !== undefined) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      orders: count,
    }));
  }, [orders]);

  // Promo code usage
  const promoUsage = React.useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (o.promo_code) {
        if (!counts[o.promo_code]) counts[o.promo_code] = { count: 0, revenue: 0 };
        counts[o.promo_code].count++;
        counts[o.promo_code].revenue += Number(o.total_amount);
      }
    });
    return Object.entries(counts).map(([code, data]) => ({ code, ...data }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const todayRevenue = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((s, o) => s + Number(o.total_amount), 0);

  if (loading) return <AdminLayout activeTab="analytics"><div className="text-center py-12">Loading analytics...</div></AdminLayout>;

  return (
    <AdminLayout activeTab="analytics">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Analytics & Insights</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
            { label: "Today's Revenue", value: `Rs.${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
            { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-primary" },
            { label: "Products", value: products.length, icon: Package, color: "text-primary" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Revenue (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 40%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`Rs.${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(213, 94%, 68%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Orders (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 40%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="hsl(213, 94%, 68%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Orders by Status</h3>
            {statusData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Promo Code Usage</h3>
            {promoUsage.length === 0 ? (
              <p className="text-muted-foreground text-sm">No promo codes used yet</p>
            ) : (
              <div className="space-y-3">
                {promoUsage.map((p) => (
                  <div key={p.code} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-bold text-foreground text-sm">{p.code}</p>
                      <p className="text-xs text-muted-foreground">Used {p.count} time{p.count !== 1 ? "s" : ""}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">Rs.{p.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
