import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronDown, ChevronUp, Phone, Mail, MapPin, ShoppingCart, TrendingUp } from "lucide-react";

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
  lastOrder: string;
  tag: "First-Time" | "Returning";
  orders: Order[];
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedPhone, setExpandedPhone] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const orders = (data || []) as Order[];

      // Group by phone
      const byPhone: Record<string, Order[]> = {};
      orders.forEach((o) => {
        if (!byPhone[o.customer_phone]) byPhone[o.customer_phone] = [];
        byPhone[o.customer_phone].push(o);
      });

      const customerList: Customer[] = Object.entries(byPhone).map(([phone, ords]) => ({
        phone,
        name: ords[0].customer_name,
        email: ords[0].customer_email || "",
        totalOrders: ords.length,
        ltv: ords.reduce((s, o) => s + Number(o.total_amount), 0),
        lastOrder: ords[0].created_at,
        tag: ords.length > 1 ? "Returning" : "First-Time",
        orders: ords,
      }));

      customerList.sort((a, b) => b.ltv - a.ltv);
      setCustomers(customerList);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = search
    ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase()))
    : customers;

  return (
    <AdminLayout activeTab="customers">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Customer Directory</h1>
        <p className="text-muted-foreground mb-8">{customers.length} unique customers</p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-background border border-border/40 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No customers found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cust) => {
              const isExpanded = expandedPhone === cust.phone;
              return (
                <motion.div key={cust.phone} layout className="glass-card rounded-2xl overflow-hidden">
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-background/40 transition-colors"
                    onClick={() => setExpandedPhone(isExpanded ? null : cust.phone)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <span className="font-bold text-foreground text-sm truncate">{cust.name}</span>
                      <span className="text-sm text-muted-foreground hidden sm:block">{cust.phone}</span>
                      <span className="text-sm text-muted-foreground hidden sm:block">{cust.totalOrders} order{cust.totalOrders !== 1 ? "s" : ""}</span>
                      <span className="text-sm font-bold text-primary hidden sm:block">Rs.{cust.ltv.toLocaleString()}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${cust.tag === "Returning" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {cust.tag}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 pt-2 border-t border-border/40">
                          <div className="grid sm:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{cust.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{cust.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-sm font-bold text-primary">LTV: Rs.{cust.ltv.toLocaleString()}</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm mb-2">Order History</h4>
                          <div className="space-y-2">
                            {cust.orders.map((o) => (
                              <div key={o.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg text-sm">
                                <div>
                                  <span className="font-medium text-foreground">#{o.id.slice(0, 8)}</span>
                                  <span className="text-muted-foreground ml-2">{new Date(o.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-foreground">Rs.{Number(o.total_amount).toLocaleString()}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{o.status}</span>
                                </div>
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
