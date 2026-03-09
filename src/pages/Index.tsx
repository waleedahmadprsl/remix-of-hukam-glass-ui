import { useEffect } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryBubbles from "@/components/CategoryBubbles";
import ValuePropositions from "@/components/ValuePropositions";
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
      "description": "Your one-stop marketplace for fashion, electronics, home & more — delivered fast to your doorstep.",
      "address": { "@type": "PostalAddress", "addressLocality": "Mirpur", "addressCountry": "PK" },
      "contactPoint": { "@type": "ContactPoint", "telephone": "+92-342-680-7645", "contactType": "customer service" }
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
      <ValuePropositions />
      <CategoryBubbles />
      <FlashDeals />
      <TrendingProducts />
      <AllProducts />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Index;
