import BannerCarousel from "@/components/BannerCarousel";
import CategoryBubbles from "@/components/CategoryBubbles";
import FlashDeals from "@/components/FlashDeals";
import TrendingProducts from "@/components/TrendingProducts";
import AllProducts from "@/components/AllProducts";
import Testimonials from "@/components/Testimonials";

const Index = () => (
  <div className="bg-background">
    <BannerCarousel />
    <CategoryBubbles />
    <FlashDeals />
    <TrendingProducts />
    <AllProducts />
    <Testimonials />
  </div>
);

export default Index;
