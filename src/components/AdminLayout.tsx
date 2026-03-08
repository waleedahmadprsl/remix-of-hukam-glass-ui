import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, LayoutDashboard, Package, Tag, ShoppingCart, Zap, Activity, BarChart3, Users, Menu, X, Store, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Add noindex meta for admin pages
const useAdminNoIndex = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
};

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useAdminNoIndex();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "products", label: "Products", icon: Package, path: "/admin/products" },
    { id: "categories", label: "Categories", icon: Tag, path: "/admin/categories" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { id: "shops", label: "Shops", icon: Store, path: "/admin/shops" },
    { id: "promos", label: "Promos", icon: Zap, path: "/admin/promos" },
    { id: "customers", label: "Customers", icon: Users, path: "/admin/customers" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { id: "newsletter", label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
    { id: "logs", label: "Logs", icon: Activity, path: "/admin/logs" },
  ];

  const handleLogout = async () => { await logout(); navigate("/"); };

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground">HUK<span className="text-primary">A</span>M</h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">Admin Control Center</p>
      </div>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { navigate(tab.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-sm">
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 bg-secondary/50 backdrop-blur-md border-r border-border/40 p-4 sticky top-0 h-screen overflow-y-auto flex-col">
        <SidebarContent />
      </div>

      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">HUK<span className="text-primary">A</span>M</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-5 h-5 text-foreground" /></button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 z-50 bg-black/50" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }} className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-background border-r border-border/40 p-4 flex flex-col">
              <div className="flex justify-end mb-2">
                <button onClick={() => setSidebarOpen(false)} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
};
