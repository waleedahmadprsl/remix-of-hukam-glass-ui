import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { MiniCartProvider } from "@/context/MiniCartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MiniCart from "@/components/MiniCart";
import { useMiniCart } from "@/context/MiniCartContext";

// Public Pages
import Checkout from "@/pages/Checkout";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import TrackOrder from "./pages/TrackOrder";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminPromos from "./pages/AdminPromos";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminCustomers from "./pages/AdminCustomers";
import AdminShops from "./pages/AdminShops";
import AdminNewsletter from "./pages/AdminNewsletter";

const queryClient = new QueryClient();

const MiniCartWrapper = () => {
  const { isOpen, closeCart } = useMiniCart();
  return <MiniCart open={isOpen} onClose={closeCart} />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CartProvider>
            <MiniCartProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <MiniCartWrapper />
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
                    <Route path="/admin/shops" element={<ProtectedRoute><AdminShops /></ProtectedRoute>} />
                    <Route path="/admin/promos" element={<ProtectedRoute><AdminPromos /></ProtectedRoute>} />
                    <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                    <Route path="/admin/logs" element={<ProtectedRoute><AdminActivityLogs /></ProtectedRoute>} />
                    <Route path="/admin/newsletter" element={<ProtectedRoute><AdminNewsletter /></ProtectedRoute>} />

                    {/* Public Routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </WishlistProvider>
            </MiniCartProvider>
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
