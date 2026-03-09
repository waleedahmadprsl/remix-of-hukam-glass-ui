import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Clock, DollarSign, Warehouse, Store } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DayData { date: string; revenue: number; profit: number; }
interface LowStockProduct { id: string; title: string; stock: number; price: number; }

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalOrders: 0, totalProducts: 0, totalRevenue: 0, pendingOrders: 0,
    todaySales: 0, weekRevenue: 0, outOfStock: 0, netProfit: 0,
    inventoryValue: 0, grossMargin: 0, activeShops: 0,
  });
  const [chartData, setChartData] = React.useState<DayData[]>([]);
  const [topProducts, setTopProducts] = React.useState<{ title: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = React.useState<LowStockProduct[]>([]);

  React.useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 14);

    const [ordersRes, productsRes, allOrders, recentRes, orderItemsRes, shopsRes] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("products").select("id, stock, title, buying_cost, price"),
      supabase.from("orders").select("total_amount, created_at, status, items").order("created_at", { ascending: false }).limit(500),
      supabase.from("orders").select("id, customer_name, total_amount, status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("order_items").select("unit_price, buying_cost, quantity, created_at, order_id").order("created_at", { ascending: false }).limit(1000),
      supabase.from("shops").select("id").eq("is_active", true),
    ]);

    const orders = allOrders.data || [];
    const products = productsRes.data || [];
    const orderItems = orderItemsRes.data || [];
    const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
    const todaySales = orders.filter((o: any) => new Date(o.created_at) >= today).reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
    const weekRevenue = orders.filter((o: any) => new Date(o.created_at) >= weekAgo).reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
    const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
    const outOfStock = products.filter((p: any) => p.stock <= 0).length;

    const totalCOGS = orderItems.reduce((s: number, i: any) => s + Number(i.buying_cost || 0) * Number(i.quantity || 1), 0);
    const totalItemRevenue = orderItems.reduce((s: number, i: any) => s + Number(i.unit_price || 0) * Number(i.quantity || 1), 0);
    const netProfit = totalItemRevenue - totalCOGS;
    const grossMargin = totalItemRevenue > 0 ? Math.round(((totalItemRevenue - totalCOGS) / totalItemRevenue) * 100) : 0;
    const inventoryValue = products.reduce((s: number, p: any) => s + Number(p.buying_cost || 0) * Number(p.stock || 0), 0);

    // Low stock products (stock <= 5, sorted ascending)
    const lowStock = products
      .filter((p: any) => p.stock <= 5)
      .sort((a: any, b: any) => a.stock - b.stock)
      .slice(0, 10)
      .map((p: any) => ({ id: p.id, title: p.title, stock: p.stock, price: p.price }));
    setLowStockProducts(lowStock);

    const dayMap: Record<string, { revenue: number; profit: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = { revenue: 0, profit: 0 };
    }
    orders.forEach((o: any) => {
      const d = o.created_at.slice(0, 10);
      if (dayMap[d]) dayMap[d].revenue += Number(o.total_amount || 0);
    });
    orderItems.forEach((i: any) => {
      const d = (i.created_at || "").slice(0, 10);
      if (dayMap[d]) dayMap[d].profit += (Number(i.unit_price || 0) - Number(i.buying_cost || 0)) * Number(i.quantity || 1);
    });
    setChartData(Object.entries(dayMap).map(([date, v]) => ({ date: date.slice(5), revenue: v.revenue, profit: v.profit })));

    const { data: topItemsData } = await supabase.from("order_items").select("product_title, quantity");
    const productCounts: Record<string, number> = {};
    (topItemsData || []).forEach((item: any) => {
      const title = item.product_title || "Unknown";
      productCounts[title] = (productCounts[title] || 0) + Number(item.quantity || 1);
    });
    setTopProducts(Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([title, count]) => ({ title, count })));
    setRecentOrders(recentRes.data || []);

    setStats({
      totalOrders: ordersRes.count || 0, totalProducts: products.length, totalRevenue,
      pendingOrders, todaySales, weekRevenue, outOfStock, netProfit, inventoryValue,
      grossMargin, activeShops: (shopsRes.data || []).length,
    });
  };

  const cards = [
    { label: "Today's Sales", value: `Rs.${stats.todaySales.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { label: "Net Profit", value: `Rs.${stats.netProfit.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Inventory Value", value: `Rs.${stats.inventoryValue.toLocaleString()}`, icon: Warehouse, color: "text-blue-600" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-orange-500" },
    { label: "Weekly Revenue", value: `Rs.${stats.weekRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { label: "Gross Margin", value: `${stats.grossMargin}%`, icon: DollarSign, color: stats.grossMargin >= 30 ? "text-green-600" : "text-orange-500" },
    { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangle, color: stats.outOfStock > 0 ? "text-destructive" : "text-muted-foreground" },
    { label: "Active Shops", value: stats.activeShops, icon: Store, color: "text-primary" },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">{card.label}</p>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{card.value}</h2>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-4 sm:p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Revenue vs Profit (14 Days)</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4">Top Selling Products</h3>
            {topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No sales data yet.</p> : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.title} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <span className="flex-1 text-sm text-foreground truncate">{p.title}</span>
                    <span className="text-xs font-bold text-muted-foreground">{p.count} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="glass-card p-4 sm:p-6 rounded-2xl mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-bold text-foreground">Inventory Alerts — Low Stock</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">₨ {p.price.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${p.stock <= 0 ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"}`}>
                    {p.stock <= 0 ? "Out" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-4 sm:p-6 rounded-2xl">
          <h3 className="font-bold text-foreground mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground text-xs"><th className="pb-2 pr-4">Order</th><th className="pb-2 pr-4">Customer</th><th className="pb-2 pr-4">Amount</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Date</th></tr></thead>
              <tbody>
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="border-t border-border/30">
                    <td className="py-2 pr-4 font-mono font-bold text-foreground">#{o.id.slice(0, 8)}</td>
                    <td className="py-2 pr-4 text-foreground">{o.customer_name}</td>
                    <td className="py-2 pr-4 font-semibold text-primary">Rs.{Number(o.total_amount).toLocaleString()}</td>
                    <td className="py-2 pr-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[o.status] || ""}`}>{o.status}</span></td>
                    <td className="py-2 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
