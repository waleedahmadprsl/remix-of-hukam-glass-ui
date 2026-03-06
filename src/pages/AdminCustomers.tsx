import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronDown, ChevronUp, Phone, Mail, TrendingUp, Search } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: string;
}

interface Customer {
  phone: string;
  name: string;
  email: string;
  totalOrders: number;
  ltv: number;
  avgOrder: number;
  lastOrder: string;
  tag: "First-Time" | "Returning";
  orders: Order[];
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedPhone, setExpandedPhone] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [filterTag, setFilterTag] = React.useState<"all" | "First-Time" | "Returning">("all");

  React.useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const orders = (data || []) as Order[];
      const byPhone: Record<string, Order[]> = {};
      orders.forEach((o) => { if (!byPhone[o.customer_phone]) byPhone[o.customer_phone] = []; byPhone[o.customer_phone].push(o); });
      const list: Customer[] = Object.entries(byPhone).map(([phone, ords]) => ({
        phone, name: ords[0].customer_name, email: ords[0].customer_email || "",
        totalOrders: ords.length, ltv: ords.reduce((s, o) => s + Number(o.total_amount), 0),
        avgOrder: ords.reduce((s, o) => s + Number(o.total_amount), 0) / ords.length,
        lastOrder: ords[0].created_at, tag: ords.length > 1 ? "Returning" : "First-Time", orders: ords,
      }));
      list.sort((a, b) => b.ltv - a.ltv);
      setCustomers(list);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = customers.filter((c) => {
    if (filterTag !== "all" && c.tag !== filterTag) return false;
    if (search) { const q = search.toLowerCase(); return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q); }
    return true;
  });

  const totalLTV = customers.reduce((s, c) => s + c.ltv, 0);
  const returningCount = customers.filter((c) => c.tag === "Returning").length;

  return (
    <AdminLayout activeTab="customers">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-1">Customers</h1>
        <p className="text-sm text-muted-foreground mb-6">{customers.length} customers • {returningCount} returning • Total LTV: Rs.{totalLTV.toLocaleString()}</p>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm" />
          </div>
          <div className="flex gap-2">
            {(["all", "First-Time", "Returning"] as const).map((t) => (
              <button key={t} onClick={() => setFilterTag(t)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterTag === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground">No customers found.</div> : (
          <div className="space-y-3">
            {filtered.map((cust) => {
              const isExpanded = expandedPhone === cust.phone;
              return (
                <motion.div key={cust.phone} layout className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-background/40 transition-colors" onClick={() => setExpandedPhone(isExpanded ? null : cust.phone)}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-2 items-center">
                      <span className="font-bold text-foreground text-xs sm:text-sm truncate">{cust.name}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{cust.phone}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{cust.totalOrders} orders</span>
                      <span className="text-xs sm:text-sm font-bold text-primary hidden sm:block">Rs.{cust.ltv.toLocaleString()}</span>
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${cust.tag === "Returning" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{cust.tag}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-3 sm:px-5 pb-5 pt-2 border-t border-border/40">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{cust.phone}</span></div>
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{cust.email || "—"}</span></div>
                            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-sm font-bold text-primary">LTV: Rs.{cust.ltv.toLocaleString()}</span></div>
                            <div><span className="text-xs text-muted-foreground">Avg Order: </span><span className="text-sm font-semibold text-foreground">Rs.{cust.avgOrder.toFixed(0)}</span></div>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm mb-2">Order History</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {cust.orders.map((o) => (
                              <div key={o.id} className="flex items-center justify-between p-2 sm:p-3 bg-secondary/30 rounded-lg text-xs sm:text-sm">
                                <div><span className="font-medium text-foreground">#{o.id.slice(0, 8)}</span><span className="text-muted-foreground ml-2">{new Date(o.created_at).toLocaleDateString()}</span></div>
                                <div className="flex items-center gap-2 sm:gap-3"><span className="font-bold text-foreground">Rs.{Number(o.total_amount).toLocaleString()}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{o.status}</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCustomers;
