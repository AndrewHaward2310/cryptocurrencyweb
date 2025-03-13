import { useState } from "react";
import { Link } from "wouter";
import { Article, PopularArticle } from "@/lib/types";
import NewsletterSignup from "./NewsletterSignup";

interface LatestNewsProps {
  latestNews: Article[];
  popularArticles: PopularArticle[];
}

export default function LatestNews({ latestNews, popularArticles }: LatestNewsProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "bitcoin", name: "Bitcoin" },
    { id: "ethereum", name: "Ethereum" },
    { id: "altcoins", name: "Altcoins" },
    { id: "blockchain", name: "Blockchain" }
  ];

  // Filter news by category
  const filteredNews = activeCategory === "all" 
    ? latestNews 
    : latestNews.filter(article => article.category.toLowerCase() === activeCategory);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tin Tức Mới Nhất</h2>
              <div className="hidden md:block">
                <div className="flex space-x-1">
                  {categories.map(category => (
                    <button 
                      key={category.id}
                      className={`px-3 py-1 rounded-lg text-sm border ${
                        activeCategory === category.id 
                          ? "bg-blue-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                          : "bg-white border-gray-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Mobile dropdown */}
              <div className="md:hidden">
                <select 
                  className="bg-white border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* News Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map(article => (
                <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/article/${article.id}`}>
                    <div className="block group cursor-pointer">
                      <div className="relative">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-3">
                          <span>{article.timeAgo}</span>
                          <span className="mx-2">•</span>
                          <span>Bởi {article.author}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/tin-tuc">
                <div className="bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-6 py-2 rounded-full font-medium inline-block cursor-pointer">
                  Xem thêm tin tức
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            {/* Newsletter signup */}
            <div className="mb-8">
              <NewsletterSignup />
            </div>

            {/* Popular articles */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Bài Viết Phổ Biến</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {popularArticles.map((article, index) => (
                  <div key={article.id} className="p-4 hover:bg-gray-50">
                    <Link href={`/article/${article.id}`}>
                      <div className="flex items-start space-x-4 cursor-pointer">
                        <div className="flex-none">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-medium text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{article.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags cloud */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Chủ Đề Phổ Biến</h3>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Bitcoin", "Ethereum", "Blockchain", "NFT", "DeFi", 
                    "Altcoin", "Quy định", "Đầu tư", "Ví tiền điện tử", 
                    "Sàn giao dịch", "Mining", "Staking"
                  ].map(tag => (
                    <Link key={tag} href={`/tag/${tag.toLowerCase()}`}>
                      <div className="px-3 py-1 bg-blue-50 text-primary text-sm rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer">
                        {tag}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
