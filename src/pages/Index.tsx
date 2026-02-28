import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import HowItWorks from "@/components/HowItWorks";
import ProductShowcase from "@/components/ProductShowcase";
import AllProducts from "@/components/AllProducts";
import AboutUs from "@/components/AboutUs";
import Testimonials from "@/components/Testimonials";

const Index = () => (
  <div className="bg-background">
    <HeroSection />
    <TrustBadges />
    <HowItWorks />
    <ProductShowcase />
    <AllProducts />
    <AboutUs />
    <Testimonials />
  </div>
);

export default Index;
