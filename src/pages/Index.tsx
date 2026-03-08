import { useEffect } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryBubbles from "@/components/CategoryBubbles";
import FlashDeals from "@/components/FlashDeals";
import TrendingProducts from "@/components/TrendingProducts";
import AllProducts from "@/components/AllProducts";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "HUKAM",
      "url": "https://hukam.pk",
      "logo": "https://hukam.pk/favicon.png",
      "description": "Mirpur's #1 Quick Commerce — Premium tech accessories delivered in 60 minutes.",
      "address": { "@type": "PostalAddress", "addressLocality": "Mirpur", "addressCountry": "PK" },
      "contactPoint": { "@type": "ContactPoint", "telephone": "+92-327-778-6498", "contactType": "customer service" }
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div className="bg-background">
      <BannerCarousel />
      <CategoryBubbles />
      <FlashDeals />
      <TrendingProducts />
      <AllProducts />
      <Newsletter />
      <Testimonials />
    </div>
  );
};

export default Index;
