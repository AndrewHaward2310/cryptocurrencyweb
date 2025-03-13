import { ProcessedNewsItem, RawNewsItem } from '../../shared/schema';

/**
 * Class để xử lý và phân tích dữ liệu tin tức
 */
export class NewsProcessor {
  private stopWords: Set<string>;

  constructor() {
    // Khởi tạo danh sách các từ dừng (stop words)
    // Bao gồm các từ phổ biến trong tiếng Anh và tiếng Việt không mang nhiều ngữ nghĩa
    this.stopWords = new Set([
      // Tiếng Anh
      'a', 'an', 'the', 'and', 'but', 'or', 'as', 'is', 'are', 'was', 'were', 'be', 'being', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
      'may', 'might', 'must', 'for', 'of', 'to', 'in', 'on', 'by', 'at', 'from', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
      'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
      'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
      'this', 'that', 'these', 'those', 'now', 'ever', 'also', 'even', 'still',
      
      // Tiếng Việt
      'và', 'hoặc', 'của', 'là', 'được', 'trong', 'có', 'cho', 'không', 'về', 'từ', 'như', 'đến',
      'một', 'các', 'với', 'này', 'đó', 'những', 'nhiều', 'tại', 'đã', 'sẽ', 'nên', 'cần', 'để',
      'rồi', 'thì', 'mà', 'nếu', 'vì', 'khi', 'nơi', 'đang', 'làm', 'thế', 'vẫn', 'dù', 'đây', 'sau',
      'khi', 'trên', 'dưới', 'nhưng', 'lúc', 'này', 'cùng', 'thêm', 'bởi', 'vậy', 'vậy', 'đâu', 'sao'
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
    const processedItem: ProcessedNewsItem = {
      ...newsItem,
      category,
      relevanceScore,
      extracted_keywords: extractedKeywords,
      sentiment
    };
    
    return processedItem;
  }

  /**
   * Trích xuất từ khóa từ văn bản
   */
  private extractKeywords(text: string): string[] {
    // Loại bỏ ký tự đặc biệt và chuyển thành chữ thường
    const cleanText = text.toLowerCase().replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '');
    
    // Tách từ
    const words = cleanText.split(/\s+/);
    
    // Lọc bỏ các từ dừng và các từ quá ngắn
    const filteredWords = words.filter(word => 
      word.length > 2 && !this.stopWords.has(word)
    );
    
    // Đếm tần suất từ
    const wordFrequency: {[key: string]: number} = {};
    for (const word of filteredWords) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
    
    // Sắp xếp theo tần suất và lấy top 10 từ khóa
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Phát hiện danh mục dựa trên nội dung và từ khóa
   */
  private detectCategory(title: string, content: string, keywords: string[]): string {
    const combinedText = (title + ' ' + content + ' ' + keywords.join(' ')).toLowerCase();
    
    const categoryMapping: {[key: string]: {name: string, keywords: string[]}} = {
      bitcoin: { 
        name: 'Bitcoin', 
        keywords: ['bitcoin', 'btc', 'satoshi', 'nakamoto', 'halving', 'mining']
      },
      ethereum: { 
        name: 'Ethereum', 
        keywords: ['ethereum', 'eth', 'vitalik', 'buterin', 'smart contract', 'gas', 'gwei']
      },
      altcoins: { 
        name: 'Altcoins', 
        keywords: ['altcoin', 'token', 'litecoin', 'cardano', 'ada', 'solana', 'sol', 'polkadot', 'dot', 'dogecoin', 'doge']
      },
      defi: { 
        name: 'DeFi', 
        keywords: ['defi', 'decentralized finance', 'yield farming', 'liquidity', 'dex', 'amm', 'lending', 'borrowing', 'staking', 'aave', 'compound']
      },
      nft: { 
        name: 'NFT', 
        keywords: ['nft', 'non-fungible', 'collectible', 'art', 'bored ape', 'cryptopunk', 'opensea', 'metaverse']
      },
      regulation: { 
        name: 'Quy Định', 
        keywords: ['regulation', 'law', 'legal', 'quy định', 'pháp luật', 'sec', 'cftc', 'government', 'tax', 'ban', 'illegal']
      },
      blockchain: { 
        name: 'Blockchain', 
        keywords: ['blockchain', 'distributed ledger', 'consensus', 'nodes', 'protocol', 'layer 1', 'layer 2', 'scaling']
      },
      trading: { 
        name: 'Giao Dịch', 
        keywords: ['trading', 'trader', 'exchange', 'margin', 'futures', 'technical analysis', 'chart', 'position', 'leverage', 'long', 'short']
      },
    };
    
    // Tìm danh mục phù hợp nhất
    let bestMatchCategory = 'Tin Tức';
    let bestMatchCount = 0;
    
    for (const [_, category] of Object.entries(categoryMapping)) {
      let matchCount = 0;
      
      for (const keyword of category.keywords) {
        if (combinedText.includes(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestMatchCategory = category.name;
      }
    }
    
    return bestMatchCategory;
  }

  /**
   * Phân tích tình cảm của nội dung (đơn giản)
   */
  private analyzeSentiment(title: string, content: string): 'positive' | 'negative' | 'neutral' {
    const combinedText = (title + ' ' + content).toLowerCase();
    
    // Từ điển tình cảm (từ tích cực và tiêu cực)
    const positiveWords = [
      // Tiếng Anh
      'good', 'great', 'excellent', 'positive', 'bull', 'bullish', 'rally', 'surge', 'soar', 'gain',
      'increase', 'profit', 'success', 'successful', 'up', 'uptrend', 'grow', 'growth', 'opportunity',
      'promising', 'potential', 'boost', 'improve', 'improvement', 'optimistic', 'overcome', 'recover',
      'recovery', 'rise', 'rising', 'support', 'win', 'breakthrough', 'adoption', 'advantage',
      // Tiếng Việt
      'tốt', 'tuyệt vời', 'xuất sắc', 'tích cực', 'tăng', 'phục hồi', 'lãi', 'lợi nhuận', 'thành công',
      'cơ hội', 'tiềm năng', 'cải thiện', 'lạc quan', 'vượt qua', 'tăng trưởng', 'hỗ trợ', 'đột phá'
    ];
    
    const negativeWords = [
      // Tiếng Anh
      'bad', 'poor', 'negative', 'bear', 'bearish', 'crash', 'decline', 'decrease', 'dip', 'down',
      'downtrend', 'drop', 'fall', 'falling', 'fear', 'fud', 'loss', 'lose', 'risk', 'risky', 'sell',
      'selling', 'sold', 'struggle', 'tumble', 'uncertainty', 'unstable', 'volatile', 'vulnerability',
      'weak', 'worry', 'worrying', 'worried', 'concern', 'concerning', 'problem', 'issue', 'threat',
      // Tiếng Việt
      'tồi', 'kém', 'tiêu cực', 'giảm', 'sụp đổ', 'khủng hoảng', 'lỗ', 'sợ hãi', 'rủi ro', 'bán',
      'bất ổn', 'biến động', 'yếu', 'lo ngại', 'vấn đề', 'mối đe dọa', 'bất lợi', 'thất bại'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Đếm từ tích cực
    for (const word of positiveWords) {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    }
    
    // Đếm từ tiêu cực
    for (const word of negativeWords) {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    }
    
    // Xác định tình cảm dựa trên số lượng từ tích cực và tiêu cực
    if (positiveCount > negativeCount * 1.5) {
      return 'positive';
    } else if (negativeCount > positiveCount * 1.5) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Tính điểm liên quan cho một tin tức
   */
  private calculateRelevanceScore(
    newsItem: RawNewsItem, 
    keywords: string[], 
    category: string
  ): number {
    // Các yếu tố ảnh hưởng đến điểm liên quan
    const factors = {
      hasTitle: newsItem.title.length > 0 ? 1 : 0,
      contentLength: Math.min(1, newsItem.content.length / 500), // Chuẩn hóa độ dài nội dung
      keywordCount: Math.min(1, keywords.length / 5), // Chuẩn hóa số lượng từ khóa
      hasImage: newsItem.image_url.length > 0 ? 1 : 0,
      hasCategory: category !== 'Tin Tức' ? 1 : 0.7, // Ưu tiên tin tức có danh mục cụ thể
      isFresh: Math.max(0, 1 - ((new Date().getTime() - newsItem.timestamp.getTime()) / (24 * 60 * 60 * 1000))), // Ưu tiên tin tức mới
    };
    
    // Tính điểm tổng hợp (thang điểm 0-10)
    const score = (
      factors.hasTitle * 2 + 
      factors.contentLength * 2 + 
      factors.keywordCount * 2 + 
      factors.hasImage * 1 + 
      factors.hasCategory * 1 + 
      factors.isFresh * 2
    );
    
    return Math.min(10, score);
  }
  
  /**
   * Lọc các tin tức bị trùng lặp hoặc tương tự
   */
  filterDuplicates(newsItems: ProcessedNewsItem[]): ProcessedNewsItem[] {
    const uniqueItems: ProcessedNewsItem[] = [];
    const titleFingerprints = new Set<string>();
    
    for (const item of newsItems) {
      // Tạo "dấu vân tay" từ tiêu đề (bỏ ký tự đặc biệt, chuyển thành chữ thường)
      const titleFingerprint = item.title.toLowerCase()
        .replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '')  // Bỏ ký tự đặc biệt
        .replace(/\s+/g, ' ')              // Chuẩn hóa khoảng trắng
        .trim();
      
      // Kiểm tra trùng lặp
      let isDuplicate = false;
      
      // Kiểm tra trùng lặp chính xác
      if (titleFingerprints.has(titleFingerprint)) {
        isDuplicate = true;
      } else {
        // Kiểm tra tương đồng
        const fingerprints = Array.from(titleFingerprints);
        for (let i = 0; i < fingerprints.length; i++) {
          // Nếu 2 tiêu đề có độ tương đồng cao (dùng khoảng cách Levenshtein đơn giản)
          const similarity = this.calculateSimilarity(titleFingerprint, fingerprints[i]);
          if (similarity > 0.8) {  // Ngưỡng tương đồng 80%
            isDuplicate = true;
            break;
          }
        }
      }
      
      // Nếu không trùng lặp, thêm vào kết quả
      if (!isDuplicate) {
        titleFingerprints.add(titleFingerprint);
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  }
  
  /**
   * Tính độ tương đồng giữa hai chuỗi (Jaccard similarity)
   * Trả về giá trị từ 0-1 (0: hoàn toàn khác nhau, 1: giống nhau)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Tách chuỗi thành tập hợp từ
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    // Tính số từ giống nhau
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    
    // Tính tổng số từ khác nhau
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    // Tính chỉ số Jaccard
    return intersection.size / union.size;
  }
}