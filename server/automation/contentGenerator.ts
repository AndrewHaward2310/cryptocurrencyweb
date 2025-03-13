import { ProcessedNewsItem, GeneratedArticle } from './types';
import { getImageForArticle } from './imageService';

/**
 * Tạo nội dung bài viết từ dữ liệu đã xử lý
 * @param processedData Mảng các mục tin tức đã được xử lý
 * @returns Mảng các bài viết đã tạo
 */
export async function generateArticleContent(processedData: ProcessedNewsItem[]): Promise<GeneratedArticle[]> {
  console.log('Đang tạo nội dung bài viết...');

  const generatedArticles: GeneratedArticle[] = [];

  // Nhóm các tin tức theo danh mục
  const categorizedNews = groupNewsByCategory(processedData);

  // Tạo bài viết cho mỗi danh mục
  for (const [category, newsItems] of Object.entries(categorizedNews)) {
    try {
      if (newsItems.length === 0) continue;

      // Nếu chỉ có một tin tức trong danh mục, tạo bài viết từ tin tức đó
      if (newsItems.length === 1) {
        const article = await createSingleNewsArticle(newsItems[0]);
        generatedArticles.push(article);
        continue;
      }

      // Nếu có nhiều tin tức, tạo bài viết tổng hợp
      const article = await createRoundupArticle(category, newsItems);
      generatedArticles.push(article);

    } catch (error) {
      console.error(`Lỗi khi tạo bài viết cho danh mục ${category}:`, error);
    }
  }

  console.log(`Đã tạo ${generatedArticles.length} bài viết`);
  return generatedArticles;
}

/**
 * Nhóm tin tức theo danh mục
 */
function groupNewsByCategory(newsItems: ProcessedNewsItem[]): Record<string, ProcessedNewsItem[]> {
  const categorized: Record<string, ProcessedNewsItem[]> = {};

  for (const item of newsItems) {
    if (!categorized[item.category]) {
      categorized[item.category] = [];
    }

    categorized[item.category].push(item);
  }

  return categorized;
}

/**
 * Tạo bài viết từ một tin tức duy nhất
 */
async function createSingleNewsArticle(newsItem: ProcessedNewsItem): Promise<GeneratedArticle> {
  const { originalContent } = newsItem;

  // Tạo tiêu đề
  let title = originalContent.title;
  if (title.length > 100) {
    title = title.substring(0, 97) + '...';
  }

  // Tạo đoạn tóm tắt
  const excerpt = newsItem.summary || originalContent.summary;

  // Tạo nội dung
  let content = `
<p>${excerpt}</p>

<p>${originalContent.content}</p>

<h2>Phân tích</h2>
<p>Những thông tin từ ${originalContent.source} cho thấy ${getSentimentText(newsItem.sentiment)} về chủ đề này. Các từ khóa chính bao gồm ${newsItem.keywords.join(', ')}.</p>

<p>Thị trường tiền điện tử tiếp tục phát triển và thay đổi nhanh chóng. Các nhà đầu tư nên luôn cập nhật thông tin mới nhất và thực hiện nghiên cứu kỹ lưỡng trước khi đưa ra quyết định đầu tư.</p>
`;

  // Tạo bài viết
  const article: GeneratedArticle = {
    title,
    excerpt,
    content,
    category: newsItem.category,
    author: 'AI News Bot',
    source_urls: [originalContent.url]
  };

  // Thêm hình ảnh cho bài viết
  try {
    const imageUrl = await getImageForArticle(title, newsItem.category);
    if (imageUrl) {
      article.image_url = imageUrl;
    }
  } catch (error) {
    console.error('Lỗi khi lấy hình ảnh cho bài viết:', error);
  }

  return article;
}

/**
 * Tạo bài viết tổng hợp từ nhiều tin tức trong cùng một danh mục
 */
async function createRoundupArticle(category: string, newsItems: ProcessedNewsItem[]): Promise<GeneratedArticle> {
  // Sắp xếp theo mức độ quan trọng
  newsItems.sort((a, b) => b.importance - a.importance);

  // Lấy tin tức quan trọng nhất
  const mainNews = newsItems[0];

  // Tạo tiêu đề
  const title = `${getCategoryTitle(category)}: ${mainNews.originalContent.title}`;

  // Tạo đoạn tóm tắt
  const excerpt = `Cập nhật tin tức mới nhất về ${category} bao gồm ${newsItems.slice(0, 3).map(item => item.originalContent.title.split(':')[0]).join(', ')} và hơn thế nữa.`;

  // Tạo nội dung
  let content = `<p>${excerpt}</p>`;

  // Thêm tin tức chính
  content += `
<h2>${mainNews.originalContent.title}</h2>
<p>${mainNews.originalContent.content}</p>
<p><em>Nguồn: <a href="${mainNews.originalContent.url}" target="_blank">${mainNews.originalContent.source}</a></em></p>
`;

  // Thêm các tin tức khác
  if (newsItems.length > 1) {
    content += `<h2>Tin tức khác về ${category}</h2>`;

    for (let i = 1; i < Math.min(newsItems.length, 4); i++) {
      const news = newsItems[i];
      content += `
<h3>${news.originalContent.title}</h3>
<p>${news.summary || news.originalContent.summary}</p>
<p><em>Nguồn: <a href="${news.originalContent.url}" target="_blank">${news.originalContent.source}</a></em></p>
`;
    }
  }

  // Thêm kết luận
  content += `
<h2>Nhận định</h2>
<p>Thị trường ${category.toLowerCase()} đang thể hiện xu hướng ${getSentimentText(getAverageSentiment(newsItems))}. Các nhà đầu tư nên tiếp tục theo dõi diễn biến và cập nhật thông tin mới nhất về lĩnh vực này.</p>
`;

  // Thu thập URLs
  const sourceUrls = newsItems.map(item => item.originalContent.url);

  // Tạo bài viết
  const article: GeneratedArticle = {
    title,
    excerpt,
    content,
    category,
    author: 'AI News Bot',
    source_urls: sourceUrls
  };

  // Thêm hình ảnh cho bài viết
  try {
    const imageUrl = await getImageForArticle(title, category);
    if (imageUrl) {
      article.image_url = imageUrl;
    }
  } catch (error) {
    console.error('Lỗi khi lấy hình ảnh cho bài viết:', error);
  }

  return article;
}

/**
 * Lấy tiêu đề cho danh mục
 */
function getCategoryTitle(category: string): string {
  const titleMap: {[key: string]: string} = {
    'Bitcoin': 'Tin mới nhất về Bitcoin',
    'Ethereum': 'Cập nhật Ethereum',
    'DeFi': 'Xu hướng DeFi',
    'NFTs': 'Thế giới NFT',
    'Quy Định': 'Quy định mới',
    'Tin Tức': 'Tin tức tiền điện tử',
    'Hướng Dẫn': 'Hướng dẫn tiền điện tử'
  };

  return titleMap[category] || `Tin tức ${category}`;
}

/**
 * Lấy text mô tả sentiment
 */
function getSentimentText(sentiment: number): string {
  if (sentiment > 0.5) return 'rất tích cực';
  if (sentiment > 0.1) return 'tích cực';
  if (sentiment > -0.1) return 'trung lập';
  if (sentiment > -0.5) return 'tiêu cực';
  return 'rất tiêu cực';
}

/**
 * Tính sentiment trung bình của các tin tức
 */
function getAverageSentiment(newsItems: ProcessedNewsItem[]): number {
  const sum = newsItems.reduce((acc, item) => acc + item.sentiment, 0);
  return sum / newsItems.length;
}
import { ProcessedNewsItem, GeneratedArticle } from './types';
import { getImageForArticle } from './imageService';

export class ContentGenerator {
  /**
   * Tạo bài viết từ các tin tức đã xử lý
   */
  public async generateArticle(processedItems: ProcessedNewsItem[]): Promise<GeneratedArticle> {
    // Sắp xếp theo điểm relevance và lấy các mục tin tức hàng đầu
    const topItems = processedItems
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    if (topItems.length === 0) {
      throw new Error('Không có đủ dữ liệu để tạo bài viết');
    }

    console.log(`Đang tạo bài viết từ ${topItems.length} mục tin tức hàng đầu`);

    // Xác định thông tin chính từ item đầu tiên
    const primaryItem = topItems[0];
    const category = this.determinePrimaryCategory(topItems);

    // Tạo tiêu đề bài viết
    const title = this.generateTitle(primaryItem, topItems);

    // Tạo đoạn tóm tắt
    const excerpt = this.generateExcerpt(primaryItem, topItems);

    // Tạo nội dung chi tiết
    const content = await this.generateContent(topItems);

    // Lấy hình ảnh cho bài viết
    const imageUrl = await getImageForArticle(title, primaryItem.extractedKeywords);

    // Tạo bài viết cuối cùng
    const article: GeneratedArticle = {
      title,
      excerpt,
      content,
      category,
      author: 'AI News Bot',
      imageUrl: imageUrl || undefined
    };

    console.log('Đã tạo bài viết thành công:', title);
    return article;
  }

  /**
   * Xác định danh mục chính dựa trên các mục tin tức hàng đầu
   */
  private determinePrimaryCategory(items: ProcessedNewsItem[]): string {
    // Đếm tần suất của các danh mục
    const categoryCounts: { [category: string]: number } = {};

    for (const item of items) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    // Sắp xếp danh mục theo tần suất và lấy danh mục phổ biến nhất
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length > 0) {
      return sortedCategories[0][0];
    }

    // Mặc định nếu không tìm thấy
    return 'crypto';
  }

  /**
   * Tạo tiêu đề bài viết
   */
  private generateTitle(primaryItem: ProcessedNewsItem, items: ProcessedNewsItem[]): string {
    // Sử dụng tiêu đề của tin tức chính làm cơ sở
    // Trong thực tế, sẽ có logic phức tạp hơn để tạo tiêu đề độc đáo

    if (primaryItem.title.length <= 70) {
      return primaryItem.title;
    }

    // Nếu tiêu đề quá dài, rút gọn
    return primaryItem.title.substring(0, 67) + '...';
  }

  /**
   * Tạo đoạn tóm tắt
   */
  private generateExcerpt(primaryItem: ProcessedNewsItem, items: ProcessedNewsItem[]): string {
    // Tạo đoạn tóm tắt dựa trên nội dung tin tức chính
    const maxLength = 160;
    let excerpt = '';

    if (primaryItem.content.length <= maxLength) {
      excerpt = primaryItem.content;
    } else {
      // Tìm vị trí kết thúc câu gần với maxLength
      const truncated = primaryItem.content.substring(0, maxLength);
      const lastPeriod = truncated.lastIndexOf('.');

      if (lastPeriod > maxLength / 2) {
        excerpt = truncated.substring(0, lastPeriod + 1);
      } else {
        excerpt = truncated + '...';
      }
    }

    return excerpt;
  }

  /**
   * Tạo nội dung chi tiết
   */
  private async generateContent(items: ProcessedNewsItem[]): Promise<string> {
    const primaryItem = items[0];
    let content = '';

    // Đoạn mở đầu
    content += `<p>${primaryItem.content}</p>\n\n`;

    // Thêm thông tin từ các mục tin tức khác
    if (items.length > 1) {
      content += `<h2>Chi tiết thêm</h2>\n\n`;

      for (let i = 1; i < items.length; i++) {
        const item = items[i];

        // Tạo tiêu đề phụ
        content += `<h3>${item.title}</h3>\n\n`;

        // Thêm nội dung chính
        content += `<p>${item.content}</p>\n\n`;

        // Thêm nguồn tham khảo
        content += `<p><em>Nguồn: <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.source}</a></em></p>\n\n`;
      }
    }

    // Đoạn kết luận
    content += `<h2>Kết luận</h2>\n\n`;
    content += `<p>Các phát triển trong thị trường crypto tiếp tục cho thấy sự trưởng thành của ngành. Các nhà đầu tư nên luôn cập nhật thông tin và thực hiện nghiên cứu kỹ lưỡng trước khi đưa ra quyết định đầu tư.</p>`;

    return content;
  }
}

export async function generateArticleFromNews(processedItems: ProcessedNewsItem[]): Promise<GeneratedArticle> {
  const generator = new ContentGenerator();
  return await generator.generateArticle(processedItems);
}