import { 
  RawNewsItem, 
  ProcessedNewsItem 
} from '../../shared/schema';
import { CrawledContent } from './types';

/**
 * Xử lý ngôn ngữ tự nhiên cho các tin tức crypto
 */
export class NLPProcessor {
  private stopWords: Set<string>;

  constructor() {
    this.stopWords = new Set([
      'và', 'hoặc', 'trong', 'ngoài', 'của', 'từ', 'với', 'cho', 'bởi', 'về', 'như', 'là',
      'có', 'được', 'không', 'những', 'các', 'một', 'để', 'đã', 'sẽ', 'đang', 'vào', 'ra',
      'khi', 'trên', 'dưới', 'nhưng', 'lúc', 'này', 'cùng', 'thêm', 'bởi', 'vậy', 'đâu', 'sao'
    ]);
  }

  /**
   * Xử lý một mảng các tin tức thô
   */
  async processNewsItems(newsItems: RawNewsItem[]): Promise<ProcessedNewsItem[]> {
    console.log(`Bắt đầu xử lý ${newsItems.length} tin tức...`);

    const processedItems: ProcessedNewsItem[] = [];

    for (const item of newsItems) {
      try {
        const processedItem = await this.processNewsItem(item);
        processedItems.push(processedItem);
      } catch (error) {
        console.error(`Lỗi khi xử lý tin tức "${item.title}":`, error);
      }
    }

    return processedItems;
  }

  /**
   * Xử lý một tin tức thô
   */
  async processNewsItem(newsItem: RawNewsItem): Promise<ProcessedNewsItem> {
    // Trích xuất từ khóa từ tiêu đề và nội dung
    const extractedKeywords = this.extractKeywords(newsItem.title + ' ' + newsItem.content);

    // Phát hiện danh mục
    const category = this.detectCategory(newsItem.title, newsItem.content, extractedKeywords);

    // Phân tích tình cảm
    const sentiment = this.analyzeSentiment(newsItem.title, newsItem.content);

    // Tính điểm liên quan
    const relevanceScore = this.calculateRelevanceScore(newsItem, extractedKeywords, category);

    // Tạo đối tượng tin tức đã xử lý
    return {
      ...newsItem,
      keywords: extractedKeywords,
      category,
      sentiment,
      relevanceScore,
      processed: true,
      processedAt: new Date()
    };
  }

  /**
   * Trích xuất từ khóa từ văn bản
   */
  extractKeywords(text: string): string[] {
    // Chuyển thành chữ thường và loại bỏ ký tự đặc biệt
    const normalizedText = text.toLowerCase().replace(/[^\p{L}\s]/gu, '');

    // Tách từng từ
    const words = normalizedText.split(/\s+/);

    // Loại bỏ stopwords và từ quá ngắn
    const filteredWords = words.filter(word => 
      word.length > 2 && !this.stopWords.has(word)
    );

    // Đếm tần suất
    const wordFreq: {[key: string]: number} = {};
    for (const word of filteredWords) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    // Sắp xếp theo tần suất giảm dần và lấy các từ khoá hàng đầu
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 10);

    return sortedWords;
  }

  /**
   * Phát hiện danh mục của bài viết
   */
  detectCategory(title: string, content: string, keywords: string[]): string {
    const text = (title + ' ' + content).toLowerCase();

    // Định nghĩa các từ khóa cho từng danh mục
    const categoryKeywords: {[key: string]: string[]} = {
      'bitcoin': ['bitcoin', 'btc', 'satoshi', 'nakamoto', 'halving'],
      'ethereum': ['ethereum', 'eth', 'vitalik', 'buterin', 'gwei', 'solidity', 'gas'],
      'altcoin': ['altcoin', 'altcoins', 'token', 'tokens'],
      'defi': ['defi', 'finance', 'yield', 'farming', 'liquidity', 'swap', 'amm', 'dao'],
      'nft': ['nft', 'nfts', 'collectible', 'art', 'token', 'opensea', 'unique'],
      'blockchain': ['blockchain', 'block', 'chain', 'consensus', 'protocol', 'node'],
      'regulation': ['regulation', 'law', 'legal', 'government', 'tax', 'compliance'],
      'market': ['market', 'price', 'chart', 'analysis', 'prediction', 'bull', 'bear'],
      'tech': ['technology', 'protocol', 'layer', 'scaling', 'update', 'fork']
    };

    // Đếm số từ khóa phù hợp cho mỗi danh mục
    const categoryScores: {[key: string]: number} = {};

    for (const [category, catKeywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of catKeywords) {
        if (text.includes(keyword)) {
          score += 1;

          // Tăng điểm nếu từ khóa xuất hiện trong tiêu đề
          if (title.toLowerCase().includes(keyword)) {
            score += 2;
          }
        }
      }
      categoryScores[category] = score;
    }

    // Tìm danh mục có điểm cao nhất
    let maxScore = 0;
    let maxCategory = 'general';

    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score;
        maxCategory = category;
      }
    }

    // Nếu không có danh mục nào có điểm, trả về 'general'
    return maxScore > 0 ? maxCategory : 'general';
  }

  /**
   * Phân tích tình cảm của bài viết
   */
  analyzeSentiment(title: string, content: string): 'positive' | 'negative' | 'neutral' {
    const text = (title + ' ' + content).toLowerCase();

    // Từ điển cảm xúc
    const positiveWords = [
      'tăng', 'lợi nhuận', 'tích cực', 'tăng trưởng', 'thành công', 'lạc quan',
      'bullish', 'đột phá', 'hồi phục', 'phát triển', 'tiến bộ', 'vững mạnh', 
      'tiềm năng', 'cơ hội', 'ổn định', 'tốt', 'tuyệt vời', 'khả quan'
    ];

    const negativeWords = [
      'giảm', 'thua lỗ', 'tiêu cực', 'suy thoái', 'thất bại', 'bi quan',
      'bearish', 'sụp đổ', 'khủng hoảng', 'rủi ro', 'đe dọa', 'lo ngại', 
      'hoài nghi', 'bất ổn', 'rơi', 'sụt', 'xấu', 'đáng lo'
    ];

    // Đếm số từ tích cực và tiêu cực
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    }

    for (const word of negativeWords) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    }

    // Tăng trọng số cho tiêu đề
    for (const word of positiveWords) {
      if (title.toLowerCase().includes(word)) {
        positiveCount += 2;
      }
    }

    for (const word of negativeWords) {
      if (title.toLowerCase().includes(word)) {
        negativeCount += 2;
      }
    }

    // Xác định tình cảm dựa trên số lượng từ
    if (positiveCount > negativeCount + 3) {
      return 'positive';
    } else if (negativeCount > positiveCount + 3) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Tính điểm liên quan
   */
  calculateRelevanceScore(
    newsItem: RawNewsItem, 
    keywords: string[], 
    category: string
  ): number {
    let score = 50; // Điểm cơ bản

    // Tăng điểm dựa trên độ mới
    const pubDate = new Date(newsItem.pubDate);
    const now = new Date();
    const hoursAgo = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 6) {
      score += 20; // Tin rất mới
    } else if (hoursAgo < 24) {
      score += 10; // Tin trong 24h
    } else if (hoursAgo > 72) {
      score -= 10; // Tin cũ hơn 3 ngày
    }

    // Tăng điểm dựa trên nguồn tin
    const reliableSources = [
      'CoinDesk', 'Cointelegraph', 'The Block', 'Bloomberg', 'Reuters',
      'Bitcoin Magazine', 'Decrypt', 'Binance', 'CNBC', 'Forbes'
    ];

    if (reliableSources.some(source => 
      newsItem.source.toLowerCase().includes(source.toLowerCase())
    )) {
      score += 10; // Nguồn tin đáng tin cậy
    }

    // Tăng điểm dựa trên danh mục
    const highPriorityCategories = ['bitcoin', 'ethereum', 'market', 'regulation'];
    if (highPriorityCategories.includes(category)) {
      score += 5; // Danh mục quan trọng
    }

    // Giới hạn điểm từ 0-100
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Hàm xử lý nội dung đã crawl
 */
export async function processCrawledContent(rawItems: RawNewsItem[]): Promise<ProcessedNewsItem[]> {
  const processor = new NLPProcessor();
  return await processor.processNewsItems(rawItems);
}

/**
 * Mô phỏng phân tích sentiment
 * Trả về giá trị từ -1 (tiêu cực) đến 1 (tích cực)
 */
function simulateSentimentAnalysis(text: string): number {
  // Mô phỏng: Đếm số từ tích cực và tiêu cực
  const positiveWords = ['tăng', 'lợi nhuận', 'tích cực', 'tốt', 'tăng trưởng', 'cải thiện', 'đạt'];
  const negativeWords = ['giảm', 'mất', 'tiêu cực', 'xấu', 'sụt giảm', 'rủi ro', 'thất bại'];

  let score = 0;

  // Đếm từ tích cực
  positiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += matches.length * 0.1;
    }
  });

  // Đếm từ tiêu cực
  negativeWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score -= matches.length * 0.1;
    }
  });

  // Giới hạn giá trị trong khoảng [-1, 1]
  return Math.max(-1, Math.min(1, score));
}

/**
 * Mô phỏng trích xuất từ khóa
 */
function extractKeywords(text: string): string[] {
  // Mô phỏng: Trả về các từ khóa dựa trên danh sách có sẵn
  const potentialKeywords = [
    'Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'stablecoin', 'altcoin',
    'thị trường', 'giá', 'tăng trưởng', 'đầu tư', 'quy định',
    'tiền điện tử', 'blockchain', 'token', 'wallet', 'giao dịch'
  ];

  // Chọn ngẫu nhiên 3-5 từ khóa từ danh sách
  const keywords: string[] = [];
  const keywordCount = Math.floor(Math.random() * 3) + 3; // 3-5 từ khóa

  for (let i = 0; i < keywordCount; i++) {
    const randomIndex = Math.floor(Math.random() * potentialKeywords.length);
    const keyword = potentialKeywords[randomIndex];

    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

/**
 * Mô phỏng trích xuất thực thể
 */
function extractEntities(text: string): string[] {
  // Mô phỏng: Trả về các thực thể dựa trên danh sách có sẵn
  const potentialEntities = [
    'Bitcoin', 'Ethereum', 'Binance', 'Coinbase', 'Solana',
    'SEC', 'CFTC', 'EU', 'Trung Quốc', 'Mỹ',
    'Vitalik Buterin', 'Elon Musk', 'CZ', 'Michael Saylor'
  ];

  // Chọn ngẫu nhiên 1-3 thực thể từ danh sách
  const entities: string[] = [];
  const entityCount = Math.floor(Math.random() * 3) + 1; // 1-3 thực thể

  for (let i = 0; i < entityCount; i++) {
    const randomIndex = Math.floor(Math.random() * potentialEntities.length);
    const entity = potentialEntities[randomIndex];

    if (!entities.includes(entity)) {
      entities.push(entity);
    }
  }

  return entities;
}

/**
 * Mô phỏng tính toán mức độ quan trọng của một bài viết
 * Dựa trên nguồn, sự tương tác và nội dung
 */
function calculateImportance(content: CrawledContent): number {
  let score = 0;

  // 1. Nguồn tin tức (độ uy tín)
  const sourceTrustScores: { [key: string]: number } = {
    'CoinDesk': 0.9,
    'CoinTelegraph': 0.85,
    'CryptoSlate': 0.8,
    'Twitter': 0.7,
    'Reddit': 0.6
  };

  score += sourceTrustScores[content.source] || 0.5;

  // 2. Tương tác (nếu có)
  if (content.engagement) {
    // Views, comments, shares
    if (content.engagement.views) {
      score += Math.min(0.3, content.engagement.views / 50000);
    }

    if (content.engagement.comments) {
      score += Math.min(0.2, content.engagement.comments / 1000);
    }

    if (content.engagement.shares) {
      score += Math.min(0.3, content.engagement.shares / 5000);
    }
  }

  // 3. Nội dung (độ dài)
  score += Math.min(0.2, content.content.length / 5000);

  // Trung bình hóa (0-1)
  return Math.min(1, score / 3);
}

/**
 * Phân loại nội dung vào các danh mục
 */
function categorizeContent(content: CrawledContent): string {
  // Nếu đã có danh mục, sử dụng nó
  if (content.category) {
    return content.category;
  }

  // Nếu không, phân loại dựa vào nội dung và tags
  const text = content.title + ' ' + content.content;
  const tags = content.tags ? content.tags.join(' ') : '';

  const combinedText = text.toLowerCase() + ' ' + tags.toLowerCase();

  if (combinedText.includes('bitcoin') || combinedText.includes('btc')) {
    return 'Bitcoin';
  } else if (combinedText.includes('ethereum') || combinedText.includes('eth')) {
    return 'Ethereum';
  } else if (combinedText.includes('defi') || combinedText.includes('finance')) {
    return 'DeFi';
  } else if (combinedText.includes('nft') || combinedText.includes('token')) {
    return 'NFTs';
  } else if (combinedText.includes('quy định') || combinedText.includes('luật') || combinedText.includes('sec')) {
    return 'Quy Định';
  } else if (combinedText.includes('hướng dẫn') || combinedText.includes('guide')) {
    return 'Hướng Dẫn';
  } else {
    return 'Tin Tức';
  }
}

export default NLPProcessor;