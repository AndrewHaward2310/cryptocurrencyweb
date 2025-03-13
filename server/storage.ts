import { 
  users, 
  newsletters, 
  articles, 
  type User, 
  type InsertUser,
  type Newsletter,
  type InsertNewsletter,
  type Article,
  type InsertArticle
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Newsletter methods
  subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  unsubscribeFromNewsletter(email: string): Promise<boolean>;
  isEmailSubscribed(email: string): Promise<boolean>;
  
  // Article methods
  getArticles(limit?: number, offset?: number): Promise<Article[]>; 
  getArticleById(id: number): Promise<Article | undefined>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  getFeaturedArticles(): Promise<Article[]>;
  getPopularArticles(limit?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  incrementArticleViews(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsletters: Map<number, Newsletter>;
  private articles: Map<number, Article>;
  
  private userCurrentId: number;
  private newsletterCurrentId: number;
  private articleCurrentId: number;

  constructor() {
    this.users = new Map();
    this.newsletters = new Map();
    this.articles = new Map();
    
    this.userCurrentId = 1;
    this.newsletterCurrentId = 1;
    this.articleCurrentId = 1;
    
    // Seed some initial articles for demo purposes
    this.seedArticles();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Newsletter methods
  async subscribeToNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existing = Array.from(this.newsletters.values()).find(
      (newsletter) => newsletter.email === insertNewsletter.email
    );
    
    if (existing) {
      // Reactivate if previously unsubscribed
      if (!existing.is_active) {
        const updated = { ...existing, is_active: true };
        this.newsletters.set(existing.id, updated);
        return updated;
      }
      return existing;
    }
    
    // Create new subscription
    const id = this.newsletterCurrentId++;
    const newsletter: Newsletter = { 
      ...insertNewsletter, 
      id, 
      subscribed_at: new Date(), 
      is_active: true 
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }
  
  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const newsletter = Array.from(this.newsletters.values()).find(
      (newsletter) => newsletter.email === email
    );
    
    if (!newsletter) return false;
    
    const updated = { ...newsletter, is_active: false };
    this.newsletters.set(newsletter.id, updated);
    return true;
  }
  
  async isEmailSubscribed(email: string): Promise<boolean> {
    const newsletter = Array.from(this.newsletters.values()).find(
      (newsletter) => newsletter.email === email
    );
    
    return !!newsletter && newsletter.is_active;
  }
  
  // Article methods
  async getArticles(limit = 10, offset = 0): Promise<Article[]> {
    const allArticles = Array.from(this.articles.values());
    // Sort by published date, newest first
    const sorted = allArticles.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    
    return sorted.slice(offset, offset + limit);
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
  }
  
  async getFeaturedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.is_featured)
      .sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
  }
  
  async getPopularArticles(limit = 5): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    
    // Tự động thêm link giới thiệu ONUS vào cuối nội dung
    const onusReferralLink = "https://goonus.io/signup/6277729717510799262?utm_campaign=invite";
    const referralContent = `

## Tham khảo thêm

Bạn có thể đăng ký tài khoản ONUS để bắt đầu đầu tư tiền điện tử một cách an toàn và dễ dàng.

[Đăng ký tài khoản ONUS ngay tại đây](${onusReferralLink})
`;
    
    const updatedContent = insertArticle.content + referralContent;
    
    const article: Article = { 
      ...insertArticle,
      content: updatedContent, 
      id, 
      views: 0 
    };
    this.articles.set(id, article);
    return article;
  }
  
  async incrementArticleViews(id: number): Promise<boolean> {
    const article = this.articles.get(id);
    if (!article) return false;
    
    const updated = { ...article, views: article.views + 1 };
    this.articles.set(id, updated);
    return true;
  }
  
  // Helper method to seed initial articles
  private seedArticles() {
    // Link giới thiệu ONUS
    const onusReferralLink = "https://goonus.io/signup/6277729717510799262?utm_campaign=invite";
    const referralContent = `

## Tham khảo thêm

Bạn có thể đăng ký tài khoản ONUS để bắt đầu đầu tư tiền điện tử một cách an toàn và dễ dàng.

[Đăng ký tài khoản ONUS ngay tại đây](${onusReferralLink})
`;

    const demoArticles: InsertArticle[] = [
      {
        title: "Bitcoin hồi phục mạnh mẽ sau khi đạt giá trị 60,000 USD",
        excerpt: "Đồng tiền điện tử lớn nhất thế giới tiếp tục xu hướng tăng giá sau những tin tức tích cực từ SEC...",
        content: "Đồng tiền điện tử lớn nhất thế giới tiếp tục xu hướng tăng giá sau những tin tức tích cực từ SEC...",
        image_url: "https://images.unsplash.com/photo-1621932953986-15fcae1ae991?ixlib=rb-4.0.3",
        category: "Bitcoin",
        author: "Nguyễn Văn A",
        published_at: new Date(),
        is_featured: true
      },
      {
        title: "Ethereum chuẩn bị cập nhật mới, nhà đầu tư kỳ vọng",
        excerpt: "Cập nhật mới của Ethereum được kỳ vọng sẽ cải thiện khả năng mở rộng và giảm phí giao dịch...",
        content: "Cập nhật mới của Ethereum được kỳ vọng sẽ cải thiện khả năng mở rộng và giảm phí giao dịch...",
        image_url: "https://images.unsplash.com/photo-1620778185541-5e33df897cca?ixlib=rb-4.0.3",
        category: "Ethereum",
        author: "Trần Thị B",
        published_at: new Date(Date.now() - 60 * 60 * 1000),
        is_featured: true
      },
      {
        title: "Việt Nam cân nhắc khung pháp lý mới cho tiền điện tử",
        excerpt: "Bộ Tài chính đang xem xét đề xuất các quy định mới nhằm quản lý thị trường tiền điện tử...",
        content: "Bộ Tài chính đang xem xét đề xuất các quy định mới nhằm quản lý thị trường tiền điện tử...",
        image_url: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3",
        category: "Quy Định",
        author: "Đinh Văn C",
        published_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        is_featured: true
      },
      {
        title: "SEC chấp thuận thêm quỹ ETF Bitcoin, thị trường phản ứng tích cực",
        excerpt: "Ủy ban Chứng khoán và Giao dịch Hoa Kỳ (SEC) đã chấp thuận thêm một quỹ ETF Bitcoin, đánh dấu bước tiến quan trọng trong việc chấp nhận tiền điện tử...",
        content: "Ủy ban Chứng khoán và Giao dịch Hoa Kỳ (SEC) đã chấp thuận thêm một quỹ ETF Bitcoin, đánh dấu bước tiến quan trọng trong việc chấp nhận tiền điện tử...",
        image_url: "https://images.unsplash.com/photo-1629339942249-35366e244122?ixlib=rb-4.0.3",
        category: "Bitcoin",
        author: "Trần Văn B",
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "Thị trường NFT Việt Nam đang phát triển nhanh chóng",
        excerpt: "Cộng đồng NFT tại Việt Nam đang phát triển nhanh chóng với các dự án mới nhận được sự quan tâm từ nhà đầu tư trong và ngoài nước...",
        content: "Cộng đồng NFT tại Việt Nam đang phát triển nhanh chóng với các dự án mới nhận được sự quan tâm từ nhà đầu tư trong và ngoài nước...",
        image_url: "https://images.unsplash.com/photo-1640833906651-6bd1af7ece71?ixlib=rb-4.0.3",
        category: "NFTs",
        author: "Lê Thị C",
        published_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "Cập nhật Shanghai của Ethereum sẽ được triển khai vào tháng tới",
        excerpt: "Cộng đồng Ethereum đang chuẩn bị cho bản cập nhật Shanghai, cho phép người dùng rút ETH đã stake và mang lại các cải tiến hiệu suất khác...",
        content: "Cộng đồng Ethereum đang chuẩn bị cho bản cập nhật Shanghai, cho phép người dùng rút ETH đã stake và mang lại các cải tiến hiệu suất khác...",
        image_url: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3",
        category: "Ethereum",
        author: "Phạm Văn D",
        published_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "Hệ sinh thái DeFi đạt mốc 100 tỷ USD tổng giá trị khóa (TVL)",
        excerpt: "Tài chính phi tập trung (DeFi) tiếp tục tăng trưởng mạnh mẽ, với tổng giá trị khóa trong các giao thức đạt mốc 100 tỷ USD...",
        content: "Tài chính phi tập trung (DeFi) tiếp tục tăng trưởng mạnh mẽ, với tổng giá trị khóa trong các giao thức đạt mốc 100 tỷ USD...",
        image_url: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-4.0.3",
        category: "DeFi",
        author: "Trương Văn E",
        published_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
        is_featured: false
      },
      // Popular articles
      {
        title: "Những dự báo giá Bitcoin cho năm 2024 từ các chuyên gia hàng đầu",
        excerpt: "Các chuyên gia hàng đầu trong ngành tiền điện tử đưa ra những dự báo về giá Bitcoin trong năm 2024...",
        content: "Các chuyên gia hàng đầu trong ngành tiền điện tử đưa ra những dự báo về giá Bitcoin trong năm 2024...",
        image_url: "https://images.unsplash.com/photo-1625822534169-40fa7fddb76a?ixlib=rb-4.0.3",
        category: "Bitcoin",
        author: "Lê Văn F",
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "5 ví tiền điện tử an toàn nhất cho người dùng Việt Nam năm 2023",
        excerpt: "Tìm hiểu về những ví tiền điện tử an toàn và phổ biến nhất cho người dùng Việt Nam trong năm 2023...",
        content: "Tìm hiểu về những ví tiền điện tử an toàn và phổ biến nhất cho người dùng Việt Nam trong năm 2023...",
        image_url: "https://images.unsplash.com/photo-1652517735223-2a55eb805cce?ixlib=rb-4.0.3",
        category: "Hướng Dẫn",
        author: "Vũ Thị G",
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "Hướng dẫn đầu tư Bitcoin cho người mới bắt đầu tại Việt Nam",
        excerpt: "Bài viết hướng dẫn chi tiết cách đầu tư Bitcoin dành cho người mới bắt đầu tại Việt Nam...",
        content: "Bài viết hướng dẫn chi tiết cách đầu tư Bitcoin dành cho người mới bắt đầu tại Việt Nam...",
        image_url: "https://images.unsplash.com/photo-1613919113983-25c9e05538d0?ixlib=rb-4.0.3",
        category: "Hướng Dẫn",
        author: "Hoàng Văn H",
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "Những quy định pháp lý về tiền điện tử cần biết tại Việt Nam",
        excerpt: "Tổng hợp những quy định pháp lý hiện hành về tiền điện tử tại Việt Nam mà người dùng cần biết...",
        content: "Tổng hợp những quy định pháp lý hiện hành về tiền điện tử tại Việt Nam mà người dùng cần biết...",
        image_url: "https://images.unsplash.com/photo-1623141641376-dea3e871d6f9?ixlib=rb-4.0.3",
        category: "Quy Định",
        author: "Nguyễn Thị I",
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        is_featured: false
      },
      {
        title: "So sánh các sàn giao dịch tiền điện tử phổ biến tại Việt Nam",
        excerpt: "Phân tích và so sánh chi tiết các sàn giao dịch tiền điện tử đang phổ biến tại Việt Nam...",
        content: "Phân tích và so sánh chi tiết các sàn giao dịch tiền điện tử đang phổ biến tại Việt Nam...",
        image_url: "https://images.unsplash.com/photo-1642790227224-8e06bfad264f?ixlib=rb-4.0.3",
        category: "Hướng Dẫn",
        author: "Đào Văn K",
        published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        is_featured: false
      }
    ];
    
    // Add views to make some articles "popular"
    const popularIndices = [7, 8, 9, 10, 11];
    
    demoArticles.forEach((article, index) => {
      const id = this.articleCurrentId++;
      const views = popularIndices.includes(index) ? 100 + Math.floor(Math.random() * 500) : Math.floor(Math.random() * 50);
      
      // Thêm link giới thiệu ONUS vào nội dung bài viết
      const contentWithReferral = article.content + referralContent;
      
      this.articles.set(id, {
        ...article,
        id,
        views,
        content: contentWithReferral
      });
    });
  }
}

export const storage = new MemStorage();
