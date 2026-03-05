import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Package, Tag, ShoppingCart, Zap, Activity, BarChart3, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "products", label: "Products", icon: Package, path: "/admin/products" },
    { id: "categories", label: "Categories", icon: Tag, path: "/admin/categories" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { id: "promos", label: "Promo Codes", icon: Zap, path: "/admin/promos" },
    { id: "logs", label: "Activity Logs", icon: Activity, path: "/admin/logs" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-secondary/50 backdrop-blur-md border-r border-border/40 p-6 sticky top-0 h-screen overflow-y-auto"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            HUK<span className="text-brand-blue">A</span>M Admin
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Control Center</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                whileHover={{ x: 5 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 5 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
