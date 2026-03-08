import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Package, DollarSign, Eye, Users, MousePointerClick,
  Repeat, ArrowUpRight, ArrowDownRight, Store,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["hsl(213, 94%, 68%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(262, 83%, 58%)", "hsl(180, 60%, 50%)"];

const AdminAnalytics: React.FC = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [orderItems, setOrderItems] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [pageViews, setPageViews] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [shops, setShops] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, productsRes, pvRes, oiRes, catRes, shopRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id, title, price, stock, buying_cost, category_id, shop_id"),
        supabase.from("page_views").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("categories").select("id, name"),
        supabase.from("shops").select("id, name"),
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setPageViews(pvRes.data || []);
      setOrderItems(oiRes.data || []);
      setCategories(catRes.data || []);
      setShops(shopRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── Visitor Analytics ──
  const visitorStats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const prevWeekStart = new Date(weekAgo); prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const totalViews = pageViews.length;
    const uniqueSessions = new Set(pageViews.map(pv => pv.session_id)).size;
    const todayViews = pageViews.filter(pv => new Date(pv.created_at) >= today).length;
    const weekViews = pageViews.filter(pv => new Date(pv.created_at) >= weekAgo).length;
    const prevWeekViews = pageViews.filter(pv => {
      const d = new Date(pv.created_at);
      return d >= prevWeekStart && d < weekAgo;
    }).length;
    const weekGrowth = prevWeekViews > 0 ? Math.round(((weekViews - prevWeekViews) / prevWeekViews) * 100) : 0;

    return { totalViews, uniqueSessions, todayViews, weekViews, weekGrowth };
  }, [pageViews]);

  // Daily visitors (14 days)
  const dailyVisitors = React.useMemo(() => {
    const days: Record<string, { views: number; sessions: Set<string> }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = { views: 0, sessions: new Set() };
    }
    pageViews.forEach(pv => {
      const day = pv.created_at.slice(0, 10);
      if (days[day]) { days[day].views++; days[day].sessions.add(pv.session_id); }
    });
    return Object.entries(days).map(([date, d]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: d.views,
      visitors: d.sessions.size,
    }));
  }, [pageViews]);

  // Popular pages
  const popularPages = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(pv => { counts[pv.page_path] = (counts[pv.page_path] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([path, views]) => ({ path, views }));
  }, [pageViews]);

  // ── Conversion Funnel ──
  const funnelData = React.useMemo(() => {
    const totalSessions = new Set(pageViews.map(pv => pv.session_id)).size;
    const productViewSessions = new Set(pageViews.filter(pv => pv.page_path.startsWith("/product/")).map(pv => pv.session_id)).size;
    const checkoutSessions = new Set(pageViews.filter(pv => pv.page_path === "/checkout").map(pv => pv.session_id)).size;
    const completedOrders = orders.length;

    return [
      { stage: "Visitors", count: totalSessions, pct: 100 },
      { stage: "Product Views", count: productViewSessions, pct: totalSessions > 0 ? Math.round((productViewSessions / totalSessions) * 100) : 0 },
      { stage: "Checkout", count: checkoutSessions, pct: totalSessions > 0 ? Math.round((checkoutSessions / totalSessions) * 100) : 0 },
      { stage: "Orders", count: completedOrders, pct: totalSessions > 0 ? Math.round((completedOrders / totalSessions) * 100) : 0 },
    ];
  }, [pageViews, orders]);

  const conversionRate = React.useMemo(() => {
    const sessions = new Set(pageViews.map(pv => pv.session_id)).size;
    return sessions > 0 ? ((orders.length / sessions) * 100).toFixed(1) : "0.0";
  }, [pageViews, orders]);

  // ── Sales Performance ──
  const dailyRevenue = React.useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    orders.forEach(o => {
      const day = o.created_at.slice(0, 10);
      if (days[day] !== undefined) days[day] += Number(o.total_amount);
    });
    return Object.entries(days).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
    }));
  }, [orders]);

  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  // Average order value
  const avgOrderValue = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + Number(o.total_amount), 0) / orders.length) : 0;

  // Repeat customers
  const repeatCustomers = React.useMemo(() => {
    const phoneCounts: Record<string, number> = {};
    orders.forEach(o => { phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] || 0) + 1; });
    const repeat = Object.values(phoneCounts).filter(c => c > 1).length;
    const total = Object.keys(phoneCounts).length;
    return { repeat, total, pct: total > 0 ? Math.round((repeat / total) * 100) : 0 };
  }, [orders]);

  // Revenue by category
  const revenueByCategory = React.useMemo(() => {
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const prodCatMap = new Map(products.map(p => [p.id, p.category_id]));
    const rev: Record<string, number> = {};
    orderItems.forEach(oi => {
      const catId = prodCatMap.get(oi.product_id);
      const catName = catId ? catMap.get(catId) || "Uncategorized" : "Uncategorized";
      rev[catName] = (rev[catName] || 0) + Number(oi.unit_price || 0) * Number(oi.quantity || 1);
    });
    return Object.entries(rev).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [orderItems, products, categories]);

  // Revenue by shop
  const revenueByShop = React.useMemo(() => {
    const shopMap = new Map(shops.map(s => [s.id, s.name]));
    const rev: Record<string, number> = {};
    orderItems.forEach(oi => {
      const shopName = oi.shop_id ? shopMap.get(oi.shop_id) || "Direct" : "Direct";
      rev[shopName] = (rev[shopName] || 0) + Number(oi.unit_price || 0) * Number(oi.quantity || 1);
    });
    return Object.entries(rev).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [orderItems, shops]);

  // Promo code usage
  const promoUsage = React.useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(o => {
      if (o.promo_code) {
        if (!counts[o.promo_code]) counts[o.promo_code] = { count: 0, revenue: 0 };
        counts[o.promo_code].count++;
        counts[o.promo_code].revenue += Number(o.total_amount);
      }
    });
    return Object.entries(counts).map(([code, data]) => ({ code, ...data }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  if (loading) return <AdminLayout activeTab="analytics"><div className="text-center py-12 text-muted-foreground">Loading analytics...</div></AdminLayout>;

  return (
    <AdminLayout activeTab="analytics">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-6">Analytics & Insights</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: "Total Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign },
                { label: "Total Orders", value: orders.length, icon: ShoppingCart },
                { label: "Avg Order Value", value: `Rs.${avgOrderValue.toLocaleString()}`, icon: TrendingUp },
                { label: "Products", value: products.length, icon: Package },
                { label: "Total Visitors", value: visitorStats.uniqueSessions, icon: Users },
                { label: "Page Views", value: visitorStats.totalViews, icon: Eye },
                { label: "Conversion Rate", value: `${conversionRate}%`, icon: MousePointerClick },
                { label: "Repeat Customers", value: `${repeatCustomers.pct}%`, icon: Repeat },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{kpi.label}</p>
                    <kpi.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4">Revenue (14 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`Rs.${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4">Visitors (14 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyVisitors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Page Views" />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(142, 71%, 45%)" fill="hsl(142 71% 45% / 0.1)" strokeWidth={2} name="Unique Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ── VISITORS TAB ── */}
          <TabsContent value="visitors" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Views", value: visitorStats.totalViews, icon: Eye },
                { label: "Unique Sessions", value: visitorStats.uniqueSessions, icon: Users },
                { label: "Today's Views", value: visitorStats.todayViews, icon: TrendingUp },
                { label: "Week Growth", value: `${visitorStats.weekGrowth >= 0 ? "+" : ""}${visitorStats.weekGrowth}%`, icon: visitorStats.weekGrowth >= 0 ? ArrowUpRight : ArrowDownRight },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                    <kpi.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Visitor Trends (14 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyVisitors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2.5} name="Page Views" />
                  <Area type="monotone" dataKey="visitors" stroke="hsl(142, 71%, 45%)" fill="hsl(142 71% 45% / 0.1)" strokeWidth={2.5} name="Unique Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Most Visited Pages</h3>
              {popularPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page view data yet. Visitors will be tracked automatically.</p>
              ) : (
                <div className="space-y-2">
                  {popularPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                      <span className="flex-1 text-sm text-foreground font-mono truncate">{p.path}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{p.views} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── CONVERSION TAB ── */}
          <TabsContent value="conversion" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {funnelData.map((s, i) => (
                <motion.div key={s.stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{s.stage}</p>
                  <p className="text-2xl font-bold text-foreground">{s.count}</p>
                  <p className="text-xs text-primary font-semibold">{s.pct}% of visitors</p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                {funnelData.map((s, i) => (
                  <div key={s.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{s.stage}</span>
                      <span className="text-muted-foreground">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ background: COLORS[i % COLORS.length], minWidth: s.pct > 0 ? "2rem" : 0 }}
                      >
                        <span className="text-xs font-bold text-white">{s.pct}%</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-4 sm:p-6 rounded-2xl">
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

              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4">Repeat vs New Customers</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Repeat", value: repeatCustomers.repeat },
                        { name: "New", value: repeatCustomers.total - repeatCustomers.repeat },
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="hsl(142, 71%, 45%)" />
                      <Cell fill="hsl(213, 94%, 68%)" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ── SALES TAB ── */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign },
                { label: "Total Orders", value: orders.length, icon: ShoppingCart },
                { label: "Avg Order Value", value: `Rs.${avgOrderValue.toLocaleString()}`, icon: TrendingUp },
                { label: "Conversion Rate", value: `${conversionRate}%`, icon: MousePointerClick },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                    <kpi.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Revenue (14 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`Rs.${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Revenue by Category</h3>
                {revenueByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
                  <div className="space-y-2">
                    {revenueByCategory.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="flex-1 text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-sm font-bold text-primary">Rs.{c.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Store className="w-4 h-4" /> Revenue by Shop</h3>
                {revenueByShop.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
                  <div className="space-y-2">
                    {revenueByShop.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="flex-1 text-sm text-foreground truncate">{s.name}</span>
                        <span className="text-sm font-bold text-primary">Rs.{s.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Promo Code Performance</h3>
              {promoUsage.length === 0 ? (
                <p className="text-muted-foreground text-sm">No promo codes used yet</p>
              ) : (
                <div className="space-y-3">
                  {promoUsage.map(p => (
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
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
