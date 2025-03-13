import { useRef, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { CryptoPrice } from "@/lib/types";

interface PriceTickerProps {
  cryptoPrices: CryptoPrice[];
}

export default function PriceTicker({ cryptoPrices }: PriceTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickerRef.current) return;
    
    // Clone ticker content for infinite scrolling
    const tickerContent = tickerRef.current;
    tickerContent.innerHTML += tickerContent.innerHTML;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-marquee {
        animation: marquee 30s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    tickerContent.classList.add('animate-marquee');
    
    return () => {
      // Clean up when component unmounts
      document.head.removeChild(style);
    };
  }, [cryptoPrices]);

  if (!cryptoPrices || cryptoPrices.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary text-white py-2 overflow-hidden">
      <div className="ticker-container relative">
        <div ref={tickerRef} className="ticker-content flex items-center space-x-6 whitespace-nowrap">
          {cryptoPrices.map((crypto) => (
            <div key={crypto.symbol} className="inline-flex items-center">
              <img 
                src={crypto.logoUrl} 
                alt={crypto.name} 
                className="w-5 h-5 mr-1" 
              />
              <span className="font-medium">{crypto.symbol}:</span>
              <span className="ml-1">${crypto.price.toLocaleString()}</span>
              <span 
                className={`ml-1 text-xs flex items-center ${
                  crypto.percentChange24h >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {crypto.percentChange24h >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(crypto.percentChange24h).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
