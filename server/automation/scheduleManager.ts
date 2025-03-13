import { 
  NewsAutomationConfig,
  RawNewsItem,
  ProcessedNewsItem,
  InsertArticle
} from '../../shared/schema';
import { storage } from '../storage';
import { NewsCrawler } from './newsCrawler';
import { NLPProcessor } from './nlpProcessor';
import { ContentGenerator } from './contentGenerator';

// Declare these functions to avoid errors, they should be implemented elsewhere
async function crawlNews(): Promise<any[]> {
  // This should be implemented
  return [];
}

async function processCrawledContent(contents: any[]): Promise<any[]> {
  // This should be implemented
  return [];
}

async function generateArticleFromNews(items: any[]): Promise<any> {
  // This should be implemented
  return {};
}

export class ScheduleManager {
  private config: NewsAutomationConfig;
  private crawler: NewsCrawler;
  private processor: NLPProcessor;
  private generator: ContentGenerator;
  private fetchInterval: NodeJS.Timeout | null = null;
  private publishInterval: NodeJS.Timeout | null = null;
  private queuedArticles: ProcessedNewsItem[] = [];

  constructor(config?: NewsAutomationConfig) {
    this.config = config || this.getDefaultConfig();
    this.crawler = new NewsCrawler(this.config.sources);
    this.processor = new NLPProcessor(this.config.nlp);
    this.generator = new ContentGenerator();
  }

  /**
   * Cấu hình mặc định cho hệ thống tự động
   */
  private getDefaultConfig(): NewsAutomationConfig {
    return {
      schedule: {
        fetchInterval: 3600000, // 1 giờ
        publishTime: '08:00'    // 8 giờ sáng hàng ngày
      },
      sources: [
        { name: 'CoinDesk', url: 'https://www.coindesk.com', trustScore: 9 },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com', trustScore: 8 },
        { name: 'CryptoSlate', url: 'https://cryptoslate.com', trustScore: 7 }
      ],
      nlp: {
        minRelevanceScore: 6,  // Điểm độ liên quan tối thiểu (0-10)
        minContentLength: 300  // Độ dài nội dung tối thiểu
      },
      publishing: {
        articlesPerDay: 3,     // Số bài viết tối đa mỗi ngày
        autoPrioritize: true,  // Tự động ưu tiên các bài viết quan trọng
        defaultCategory: 'crypto'
      }
    };
  }

  /**
   * Bắt đầu lịch trình tự động
   */
  public start(): void {
    if (this.fetchInterval || this.publishInterval) {
      console.log('Hệ thống đã đang chạy, bỏ qua lệnh bắt đầu.');
      return;
    }

    console.log('Bắt đầu hệ thống tự động thu thập và đăng bài...');

    // Chạy chu trình thu thập ngay lập tức
    this.runFetchCycle();

    // Thiết lập lịch trình thu thập
    this.fetchInterval = setInterval(() => {
      this.runFetchCycle();
    }, this.config.schedule.fetchInterval);

    // Thiết lập lịch trình đăng bài
    this.scheduleNextPublishing();
  }

  /**
   * Bắt đầu lịch trình tự động (alias for backward compatibility)
   */
  public startSchedule(): void {
    this.start();
  }

  /**
   * Dừng lịch trình tự động
   */
  public stop(): void {
    console.log('Đang dừng lịch trình tự động...');

    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }

    if (this.publishInterval) {
      clearTimeout(this.publishInterval);
      this.publishInterval = null;
    }

    console.log('Lịch trình tự động đã được dừng');
  }

  /**
   * Dừng lịch trình tự động (alias for backward compatibility)
   */
  public stopSchedule(): void {
    this.stop();
  }

  /**
   * Thực hiện chu trình thu thập tin tức
   */
  private async runFetchCycle(): Promise<void> {
    try {
      console.log('Bắt đầu chu trình thu thập tin tức mới...');

      // Thu thập tin tức từ các nguồn
      const crawledContents = await crawlNews();
      console.log(`Đã thu thập được ${crawledContents.length} mục tin tức`);

      if (crawledContents.length === 0) {
        console.log('Không có tin tức mới, kết thúc chu trình');
        return;
      }

      // Xử lý tin tức với NLP
      const processedItems = await processCrawledContent(crawledContents);
      console.log(`Đã xử lý ${processedItems.length} mục tin tức với NLP`);

      // Lọc các mục tin tức có điểm độ liên quan cao
      const relevantItems = processedItems.filter(
        item => item.relevanceScore >= this.config.nlp.minRelevanceScore
      );
      console.log(`Có ${relevantItems.length} mục tin tức đạt điểm độ liên quan tối thiểu`);

      // Thêm vào hàng đợi
      this.queuedArticles.push(...relevantItems);
      console.log(`Đã thêm ${relevantItems.length} mục tin tức vào hàng đợi. Tổng số: ${this.queuedArticles.length}`);

      // Lưu các mục tin tức đã xử lý vào cơ sở dữ liệu tạm thời
      console.log('Đã hoàn thành chu trình thu thập tin tức');
    } catch (error) {
      console.error('Lỗi trong chu trình thu thập tin tức:', error);
    }
  }

  /**
   * Lên lịch đăng bài tiếp theo
   */
  private scheduleNextPublishing(): void {
    // Tính thời gian đến lần đăng bài tiếp theo
    const now = new Date();
    const [hour, minute] = this.config.schedule.publishTime.split(':').map(Number);

    const publishTime = new Date(now);
    publishTime.setHours(hour, minute, 0, 0);

    // Nếu thời gian đăng bài đã qua trong ngày, lên lịch cho ngày mai
    if (now > publishTime) {
      publishTime.setDate(publishTime.getDate() + 1);
    }

    const delay = publishTime.getTime() - now.getTime();

    // Lên lịch cho lần đăng bài tiếp theo
    this.publishInterval = setTimeout(() => {
      this.publishArticles();
      this.scheduleNextPublishing(); // Lên lịch cho lần tiếp theo
    }, delay);

    console.log(`Đã lên lịch đăng bài vào lúc ${publishTime.toLocaleString()}`);
  }

  /**
   * Đăng bài viết dựa trên tin tức đã xử lý
   */
  private async publishArticles(): Promise<void> {
    try {
      console.log('Bắt đầu đăng bài viết mới...');

      if (this.queuedArticles.length === 0) {
        console.log('Không có bài viết trong hàng đợi, bỏ qua.');
        return;
      }

      // Xác định số lượng bài viết cần xuất bản
      const numArticlesToPublish = Math.min(
        this.config.publishing.articlesPerDay,
        this.queuedArticles.length
      );

      // Sắp xếp bài viết theo điểm liên quan (nếu cần tự động ưu tiên)
      if (this.config.publishing.autoPrioritize) {
        this.queuedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      const articlesToPublish = this.queuedArticles.slice(0, numArticlesToPublish);

      for (let i = 0; i < articlesToPublish.length; i++) {
        const newsItem = this.queuedArticles[i];

        try {
          // Tạo bài viết
          const articleContent = await this.generator.generateArticle(newsItem);

          // Lưu bài viết vào cơ sở dữ liệu
          const insertArticle: InsertArticle = {
            title: articleContent.title,
            excerpt: articleContent.excerpt,
            content: articleContent.content,
            image_url: articleContent.image_url || newsItem.image_url,
            category: newsItem.category || this.config.publishing.defaultCategory,
            author: 'ONUS AI',
            is_featured: i === 0 // Bài đầu tiên sẽ là bài nổi bật
          };

          await storage.createArticle(insertArticle);
          console.log(`Đã đăng bài: ${articleContent.title}`);
        } catch (error) {
          console.error(`Lỗi khi xuất bản bài viết: ${newsItem.title}`, error);
        }
      }

      // Xóa các bài viết đã xuất bản khỏi hàng đợi
      this.queuedArticles = this.queuedArticles.slice(numArticlesToPublish);

      console.log(`Đã hoàn thành quy trình đăng ${numArticlesToPublish} bài viết.`);
    } catch (error) {
      console.error('Lỗi khi đăng bài viết:', error);
    }
  }

  /**
   * Tạo bài viết từ tin tức đã xử lý (phương thức cũ, giữ lại để tương thích)
   */
  private async createArticle(processedItems: any[]): Promise<void> {
    try {
      // Tạo bài viết từ các mục tin tức
      const article = await generateArticleFromNews(processedItems);

      // Lưu bài viết vào cơ sở dữ liệu
      const savedArticle = await storage.createArticle({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category || this.config.publishing.defaultCategory,
        author: article.author || 'ONUS AI',
        image_url: article.imageUrl || article.image_url || '/images/onus/feature.jpg'
      });

      console.log(`Đã tạo bài viết mới với ID: ${savedArticle.id}`);
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error);
    }
  }

  /**
   * Tính toán thời gian cho lần xuất bản tiếp theo
   */
  private calculateNextPublishTime(): Date {
    const now = new Date();
    // Implementation would go here
    return now;
  }
}

// Re-export functions referenced in other places
export function startNewsAutomationImpl() {
  // Implementation would go here
}

export function stopNewsAutomationImpl() {
  // Implementation would go here
}

export default ScheduleManager;