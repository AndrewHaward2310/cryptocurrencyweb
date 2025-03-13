import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Article } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("bitcoin");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: articlesData, isLoading } = useQuery<Article[]>({ 
    queryKey: ['/api/news/latest'],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  useEffect(() => {
    if (articlesData) {
      setArticles(articlesData);
    }
  }, [articlesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !excerpt || !content || !category || !author) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bài viết",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newArticle = {
        title,
        excerpt,
        content,
        category,
        author,
        imageUrl: "/images/onus/feature.jpg" // Default image
      };
      
      const response = await apiRequest(
        'POST',
        '/api/news/article',
        newArticle
      );
      
      if (response.ok) {
        const createdArticle = await response.json();
        setArticles([createdArticle, ...articles]);
        
        // Reset form
        setTitle("");
        setExcerpt("");
        setContent("");
        setCategory("bitcoin");
        setAuthor("");
        
        toast({
          title: "Thành công",
          description: "Bài viết đã được tạo thành công!",
        });
      } else {
        throw new Error("Failed to create article");
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài viết. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">ONUS - Quản lý Bài Viết</h1>
        <p className="text-center text-gray-500 mt-2">Trang quản lý nội dung cộng tác viên</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tạo Bài Viết Mới</CardTitle>
              <CardDescription>
                Thêm bài viết mới vào hệ thống của ONUS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Tóm tắt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Nhập tóm tắt nội dung (hiển thị ở trang chủ)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung đầy đủ của bài viết"
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Chủ đề</Label>
                    <Select 
                      value={category} 
                      onValueChange={setCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="altcoins">Altcoins</SelectItem>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="nfts">NFTs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Tác giả</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Tên tác giả"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang Xử Lý..." : "Đăng Bài"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bài Viết Gần Đây</CardTitle>
              <CardDescription>
                Quản lý các bài viết đã đăng gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Đang tải dữ liệu...</div>
              ) : articles && articles.length > 0 ? (
                <ul className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <li key={article.id} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{article.category}</span>
                        <span>{article.timeAgo}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có bài viết nào
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Xem Tất Cả Bài Viết
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}