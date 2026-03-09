import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <Search className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
        <p className="text-xl font-bold text-foreground mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist or may have been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25"
          >
            <Home className="w-4 h-4" /> Go Home
          </motion.button>
          <motion.button
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-secondary/50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
