import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article as ArticleType } from "@/lib/types";
import { Link } from "wouter";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArticlePage() {
  const [, params] = useRoute<{ id: string }>("/article/:id");
  const articleId = params?.id ? parseInt(params.id) : 0;
  
  const { data: article, isLoading, error } = useQuery<ArticleType>({
    queryKey: [`/api/news/article/${articleId}`],
    enabled: !!articleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);

  // Fetch related articles
  const { data: categoryArticles } = useQuery<ArticleType[]>({
    queryKey: article ? [`/api/news/category/${article.category}`] : [],
    enabled: !!article,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Set related articles when category articles change
  useEffect(() => {
    if (categoryArticles && article) {
      // Filter out current article and take up to 3 related articles
      const filtered = categoryArticles
        .filter(a => a.id !== article.id)
        .slice(0, 3);
      setRelatedArticles(filtered);
    }
  }, [categoryArticles, article]);

  // Function to handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép vào clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-80 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-60 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/">
            <div className="inline-flex items-center text-primary hover:underline cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang chủ
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <div className="mb-8">
          <Link href="/">
            <div className="inline-flex items-center text-primary hover:underline cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại tin tức
            </div>
          </Link>
        </div>

        {/* Article header */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between text-gray-500 text-sm mb-6">
            <div className="flex items-center">
              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                {article.category}
              </span>
              <span className="mx-2">•</span>
              <span>{article.timeAgo}</span>
              <span className="mx-2">•</span>
              <span>Bởi {article.author}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="flex items-center text-gray-500"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Chia sẻ
            </Button>
          </div>
          
          <div className="rounded-lg overflow-hidden mb-8">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}></div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-3xl mx-auto border-t border-gray-200 pt-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài Viết Liên Quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <Link key={related.id} href={`/article/${related.id}`}>
                  <div className="group cursor-pointer">
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {related.timeAgo}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to action - ONUS registration */}
        <div className="max-w-3xl mx-auto bg-blue-50 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bắt đầu đầu tư tiền điện tử với ONUS</h3>
          <p className="text-gray-600 mb-4">
            ONUS là sàn giao dịch tiền điện tử hàng đầu tại Việt Nam với giao diện thân thiện và phí giao dịch thấp.
            Đăng ký ngay để nhận ưu đãi đặc biệt cho người dùng mới!
          </p>
          <a 
            href="https://goonus.io/signup/6277729717510799262?utm_campaign=invite" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Đăng ký tài khoản ONUS
          </a>
        </div>
      </div>
    </div>
  );
}