import { Link } from "wouter";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CryptoPrice } from "@/lib/types";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceChartsProps {
  cryptoPrices: CryptoPrice[];
}

export default function PriceCharts({ cryptoPrices }: PriceChartsProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Only show top 4 by default
  const displayedCryptos = showAll ? cryptoPrices : cryptoPrices.slice(0, 4);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Giá Tiền Điện Tử</h2>
          <Link href="/prices">
            <div className="text-primary hover:underline font-medium text-sm cursor-pointer">
              Xem tất cả <ChevronDown className="h-4 w-4 inline ml-1" />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">#</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">Tên</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">Giá</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">24h %</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">7d %</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">Vốn hóa thị trường</TableHead>
                  <TableHead className="text-xs font-medium text-gray-900 uppercase">Biểu đồ 7d</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCryptos.map((crypto, index) => (
                  <TableRow key={crypto.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-900">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full" 
                          src={crypto.logoUrl} 
                          alt={crypto.name} 
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{crypto.name}</div>
                          <div className="text-xs text-gray-500">{crypto.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{crypto.price.toLocaleString()} $</TableCell>
                    <TableCell 
                      className={`text-sm ${
                        crypto.percentChange24h >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {crypto.percentChange24h >= 0 ? "+" : ""}{crypto.percentChange24h.toFixed(1)}%
                    </TableCell>
                    <TableCell 
                      className={`text-sm ${
                        crypto.percentChange7d >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {crypto.percentChange7d >= 0 ? "+" : ""}{crypto.percentChange7d.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{crypto.marketCap.toLocaleString()} $</TableCell>
                    <TableCell className="text-sm text-gray-900">
                      <div className="h-10 w-24">
                        {/* Chart placeholder using SVG */}
                        <div 
                          className={`w-full h-full ${
                            crypto.percentChange7d >= 0 ? "bg-green-50" : "bg-red-50"
                          } rounded relative overflow-hidden`}
                        >
                          <div className="absolute inset-0">
                            <svg 
                              viewBox="0 0 100 30" 
                              preserveAspectRatio="none" 
                              className="w-full h-full"
                            >
                              <path 
                                d={crypto.sparkline} 
                                stroke={crypto.percentChange7d >= 0 ? "#10b981" : "#ef4444"} 
                                fill="none" 
                                strokeWidth="2" 
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-primary" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Thu gọn" : "Xem thêm tiền điện tử"} 
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
