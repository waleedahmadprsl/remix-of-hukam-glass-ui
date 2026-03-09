import { useLocation, matchPath } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const RouteSEO = () => {
  const { pathname } = useLocation();

  const pageSEO = [
    {
      path: "/",
      title: "Premium Online Shopping in Pakistan",
      description: "Shop electronics, accessories, and everyday essentials at HUKAM with fast delivery and Cash on Delivery across Pakistan.",
      keywords: "online shopping Pakistan, HUKAM, cash on delivery, electronics store Pakistan",
    },
    {
      path: "/products",
      title: "All Products",
      description: "Browse all HUKAM products including chargers, earbuds, power banks, and mobile accessories with fast delivery.",
      keywords: "buy electronics online Pakistan, mobile accessories, chargers, earbuds, power banks",
    },
    {
      path: "/checkout",
      title: "Checkout",
      description: "Secure checkout at HUKAM with Cash on Delivery and quick order confirmation.",
      keywords: "checkout, secure checkout Pakistan, cash on delivery",
      noIndex: true,
    },
    {
      path: "/track-order",
      title: "Track Your Order",
      description: "Track your HUKAM order status in real time using your order details.",
      keywords: "track order Pakistan, HUKAM tracking",
    },
    {
      path: "/about",
      title: "About HUKAM",
      description: "Learn about HUKAM, our mission, and why customers trust us for fast and reliable delivery in Pakistan.",
      keywords: "about HUKAM, ecommerce Pakistan",
    },
    {
      path: "/contact",
      title: "Contact Us",
      description: "Contact HUKAM support for order help, product questions, or business inquiries.",
      keywords: "contact HUKAM, customer support",
    },
    {
      path: "/privacy-policy",
      title: "Privacy Policy",
      description: "Read the HUKAM privacy policy and learn how we protect your information.",
      keywords: "privacy policy, HUKAM privacy",
    },
    {
      path: "/terms",
      title: "Terms & Conditions",
      description: "Read HUKAM terms and conditions for shopping, payments, and deliveries.",
      keywords: "terms and conditions, HUKAM terms",
    },
    {
      path: "/refund-policy",
      title: "Refund & Return Policy",
      description: "View HUKAM return and refund policy for eligible products and timelines.",
      keywords: "refund policy, return policy Pakistan",
    },
    {
      path: "/login",
      title: "Login",
      description: "Login to your HUKAM account to manage orders and profile.",
      keywords: "HUKAM login",
      noIndex: true,
    },
    {
      path: "/signup",
      title: "Create Account",
      description: "Create your HUKAM account for faster checkout and order tracking.",
      keywords: "signup, create account",
      noIndex: true,
    },
    {
      path: "/forgot-password",
      title: "Forgot Password",
      description: "Reset your HUKAM account password securely.",
      keywords: "forgot password, reset password",
      noIndex: true,
    },
    {
      path: "/reset-password",
      title: "Reset Password",
      description: "Set a new password for your HUKAM account.",
      keywords: "reset password",
      noIndex: true,
    },
    {
      path: "/account",
      title: "My Account",
      description: "Manage your profile, addresses, and orders from your HUKAM account.",
      keywords: "my account, order history",
      noIndex: true,
    },
    {
      path: "/product/:id",
      title: "Product Details",
      description: "View product specifications, pricing, and availability on HUKAM.",
      keywords: "product details, buy online Pakistan",
    },
  ];

  const matchedPage = pageSEO.find((page) => matchPath({ path: page.path, end: true }, pathname));

  useSEO({
    title: matchedPage?.title,
    description: matchedPage?.description,
    keywords: matchedPage?.keywords,
    ogUrl: pathname,
    canonicalUrl: pathname,
    noIndex: matchedPage?.noIndex,
  });

  return null;
};

export default RouteSEO;
