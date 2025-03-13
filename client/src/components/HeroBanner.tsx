import { Link } from "wouter";
import { FeaturedNews } from "@/lib/types";

interface HeroBannerProps {
  featuredNews: FeaturedNews;
}

export default function HeroBanner({ featuredNews }: HeroBannerProps) {
  const { mainArticle, secondaryArticles } = featuredNews;

  return (
    <section className="py-8 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main featured article */}
          <div className="md:w-2/3">
            <Link href={`/article/${mainArticle.id}`}>
              <div className="block group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src="/images/onus/banner.jpg" 
                    alt={mainArticle.title} 
                    className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-white bg-primary rounded-full">
                      {mainArticle.category}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-2">{mainArticle.title}</h2>
                    <p className="text-gray-200 mb-2">{mainArticle.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-300">
                      <span>{mainArticle.timeAgo}</span>
                      <span className="mx-2">•</span>
                      <span>Bởi {mainArticle.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary featured articles */}
          <div className="md:w-1/3 flex flex-col gap-4">
            {secondaryArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden">
                <Link href={`/article/${article.id}`}>
                  <div className="block group cursor-pointer">
                    <div className="relative">
                      <img 
                        src="/images/onus/feature.jpg" 
                        alt={article.title} 
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span>{article.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
