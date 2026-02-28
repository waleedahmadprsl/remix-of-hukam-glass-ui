import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

/**
 * Fetch all products from Supabase
 */
export const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error);
    return null;
  }
  return data;
};

/**
 * Fetch a single product by ID
 */
export const fetchProductById = async (id: string) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  return data;
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (category: string) => {
  const { data, error } = await supabase.from("products").select("*").eq("category", category);
  if (error) {
    console.error("Error fetching products by category:", error);
    return null;
  }
  return data;
};

/**
 * Submit order/inquiry (customer data)
 */
export const submitOrder = async (orderData: {
  name: string;
  email: string;
  phone: string;
  product_id: string;
  product_name: string;
  message?: string;
}) => {
  const { data, error } = await supabase.from("orders").insert([orderData]);
  if (error) {
    console.error("Error submitting order:", error);
    return null;
  }
  return data;
};

/**
 * Save contact form submission
 */
export const submitContactForm = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const { data, error } = await supabase.from("contact_submissions").insert([formData]);
  if (error) {
    console.error("Error submitting contact form:", error);
    return null;
  }
  return data;
};

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (email: string) => {
  const { data, error } = await supabase.from("newsletter_subscribers").insert([{ email }]);
  if (error) {
    console.error("Error subscribing to newsletter:", error);
    return null;
  }
  return data;
};

export default supabase;
