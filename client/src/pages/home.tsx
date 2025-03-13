import Header from "@/components/Header";
import PriceTicker from "@/components/PriceTicker";
import HeroBanner from "@/components/HeroBanner";
import PriceCharts from "@/components/PriceCharts";
import LatestNews from "@/components/LatestNews";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: cryptoPrices, isLoading: isPricesLoading } = useQuery({
    queryKey: ['/api/crypto/prices'],
  });

  const { data: latestNews, isLoading: isNewsLoading } = useQuery({
    queryKey: ['/api/news/latest'],
  });

  const { data: featuredNews, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['/api/news/featured'],
  });

  const { data: popularArticles, isLoading: isPopularLoading } = useQuery({
    queryKey: ['/api/news/popular'],
  });
  
  const { toast } = useToast();
  
  const isLoading = isPricesLoading || isNewsLoading || isFeaturedLoading || isPopularLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Đang tải dữ liệu...</h2>
            <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {cryptoPrices && <PriceTicker cryptoPrices={cryptoPrices} />}
      {featuredNews && <HeroBanner featuredNews={featuredNews} />}
      {cryptoPrices && <PriceCharts cryptoPrices={cryptoPrices} />}
      <LatestNews 
        latestNews={latestNews || []} 
        popularArticles={popularArticles || []} 
      />
      <Footer />
    </div>
  );
}
