import axios from 'axios';
import * as cheerio from 'cheerio';
import { RawNewsItem } from '../../shared/schema';

/**
 * Class để thu thập tin tức từ các nguồn khác nhau
 */
export class NewsScraper {
  private sources: {[key: string]: { url: string, selector: string, titleSelector: string, contentSelector: string, imageSelector: string }};

  constructor() {
    // Cấu hình selectors cho các nguồn tin tức
    this.sources = {
      "coindesk": {
        url: "https://www.coindesk.com/tag/bitcoin/",
        selector: ".card-title", // Class chứa các bài viết
        titleSelector: "h1.heading",
        contentSelector: ".at-content-wrapper p",
        imageSelector: ".at-lead-asset img"
      },
      "cointelegraph": {
        url: "https://cointelegraph.com/tags/bitcoin",
        selector: ".post-card__title",
        titleSelector: "h1.post__title",
        contentSelector: ".post__content p",
        imageSelector: ".post-cover picture img"
      },
      "cryptoslate": {
        url: "https://cryptoslate.com/news/",
        selector: ".cs-article-title",
        titleSelector: "h1.entry-title",
        contentSelector: ".cs-post-content p",
        imageSelector: ".cs-featured-image img"
      }
    };
  }

  /**
   * Thu thập tin tức từ tất cả các nguồn đã cấu hình
   */
  async scrapeAllSources(): Promise<RawNewsItem[]> {
    console.log('Bắt đầu thu thập tin tức từ tất cả các nguồn...');
    
    // Mảng chứa tất cả các promise thu thập
    const scrapingPromises: Promise<RawNewsItem[]>[] = [];
    
    // Thu thập từ từng nguồn
    for (const [source, config] of Object.entries(this.sources)) {
      console.log(`Đang thu thập từ ${source}...`);
      scrapingPromises.push(
        this.scrapeWebsite(source, config.url, config.selector, config.titleSelector, config.contentSelector, config.imageSelector)
      );
    }
    
    // Đợi tất cả các promise hoàn thành
    const results = await Promise.allSettled(scrapingPromises);
    
    // Tổng hợp kết quả
    const allNews: RawNewsItem[] = [];
    
    results.forEach((result, index) => {
      const sourceName = Object.keys(this.sources)[index];
      
      if (result.status === 'fulfilled') {
        console.log(`Thu thập thành công từ ${sourceName}: ${result.value.length} bài.`);
        allNews.push(...result.value);
      } else {
        console.error(`Lỗi khi thu thập từ ${sourceName}:`, result.reason);
      }
    });
    
    return allNews;
  }

  /**
   * Thu thập tin tức từ một website cụ thể
   */
  async scrapeWebsite(
    source: string,
    url: string,
    selector: string,
    titleSelector: string,
    contentSelector: string,
    imageSelector: string
  ): Promise<RawNewsItem[]> {
    try {
      // Lấy HTML của trang
      const response = await axios.get(url);
      const html = response.data;
      
      // Load HTML vào cheerio
      const $ = cheerio.load(html);
      
      // Tìm các bài viết
      const articles = $(selector);
      
      console.log(`Tìm thấy ${articles.length} bài viết trên ${source}.`);
      
      // Mảng kết quả
      const newsItems: RawNewsItem[] = [];
      
      // Giới hạn số lượng bài viết để tránh quá tải
      const maxArticles = Math.min(articles.length, 5);
      
      // Thu thập thông tin từ 5 bài viết đầu tiên
      for (let i = 0; i < maxArticles; i++) {
        const articleElement = articles.eq(i);
        
        // Lấy link bài viết
        const articleLink = articleElement.find('a').attr('href');
        
        if (!articleLink) continue;
        
        // Đảm bảo link đầy đủ
        const fullUrl = articleLink.startsWith('http') 
          ? articleLink 
          : new URL(articleLink, url).toString();
        
        try {
          // Thu thập nội dung chi tiết từ bài viết
          const articleContent = await this.scrapeArticleContent(
            fullUrl, 
            titleSelector, 
            contentSelector, 
            imageSelector
          );
          
          // Tạo đối tượng tin tức
          const newsItem: RawNewsItem = {
            title: articleContent.title,
            content: articleContent.content,
            source: source,
            url: fullUrl,
            image_url: articleContent.imageUrl,
            timestamp: new Date()
          };
          
          newsItems.push(newsItem);
          
        } catch (error) {
          console.error(`Lỗi khi thu thập bài viết từ ${fullUrl}:`, error);
        }
      }
      
      return newsItems;
      
    } catch (error) {
      console.error(`Lỗi khi thu thập từ ${source}:`, error);
      return [];
    }
  }

  /**
   * Thu thập nội dung chi tiết của một bài viết từ URL
   */
  async scrapeArticleContent(
    url: string,
    titleSelector: string,
    contentSelector: string,
    imageSelector: string
  ): Promise<{ title: string, content: string, imageUrl: string }> {
    try {
      // Lấy HTML của trang
      const response = await axios.get(url);
      const html = response.data;
      
      // Load HTML vào cheerio
      const $ = cheerio.load(html);
      
      // Lấy tiêu đề
      const title = $(titleSelector).text().trim();
      
      // Lấy nội dung
      let content = '';
      $(contentSelector).each((_, element) => {
        content += $(element).text().trim() + '\n\n';
      });
      
      // Lấy URL ảnh
      let imageUrl = $(imageSelector).attr('src') || '';
      
      // Đảm bảo URL ảnh đầy đủ
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = new URL(imageUrl, url).toString();
      }
      
      // Sử dụng ảnh mặc định nếu không tìm thấy
      if (!imageUrl) {
        imageUrl = '/images/onus/crypto-default.jpg';
      }
      
      return { title, content, imageUrl };
      
    } catch (error) {
      console.error(`Lỗi khi thu thập nội dung từ ${url}:`, error);
      throw error;
    }
  }
}