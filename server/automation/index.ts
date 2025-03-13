import { NewsCrawler } from './newsCrawler';
import { NLPProcessor } from './nlpProcessor';
import { ContentGenerator } from './contentGenerator';
import { ScheduleManager } from './scheduleManager';
import { ImageService } from './imageService';
import { CrawledContent, RawNewsItem, ScrapedNewsItem, ProcessedNewsItem, GeneratedContent, NewsScraperConfig } from './types';
import { startNewsAutomationImpl, stopNewsAutomationImpl } from './scheduleManager';
import { getCryptoPrices } from '../api';


// Khởi tạo các dịch vụ
const newsCrawler = new NewsCrawler();
const nlpProcessor = new NLPProcessor();
const imageService = new ImageService();
const contentGenerator = new ContentGenerator(imageService);
let scheduleManager: ScheduleManager | null = null;

// Trạng thái của hệ thống
let isRunning = false;

// Re-export the types so they can be imported from this module
export type {
  RawNewsItem,
  ScrapedNewsItem,
  ProcessedNewsItem,
  GeneratedContent,
  NewsScraperConfig
};

// Create a singleton instance to manage the schedule
let isAutomationRunning = false;

/**
 * Khởi động hệ thống tự động thu thập tin tức
 */
export const startNewsAutomation = async (): Promise<boolean> => {
  if (isAutomationRunning) {
    console.log('News automation is already running');
    return false;
  }

  try {
    // Fetch initial crypto prices to ensure we have data
    await fetchCryptoPrices();

    // Start the automation
    await startNewsAutomationImpl();
    isAutomationRunning = true;

    console.log('News automation started successfully');
    return true;
  } catch (error) {
    console.error('Failed to start news automation:', error);
    return false;
  }
};

/**
 * Dừng hệ thống tự động thu thập tin tức
 */
export const stopNewsAutomation = (): boolean => {
  if (!isAutomationRunning) {
    console.log('News automation is not running');
    return false;
  }

  try {
    stopNewsAutomationImpl();
    isAutomationRunning = false;

    console.log('News automation stopped successfully');
    return true;
  } catch (error) {
    console.error('Failed to stop news automation:', error);
    return false;
  }
};

/**
 * Check if the news automation is currently running
 */
export const isNewsAutomationRunning = (): boolean => {
  return isAutomationRunning;
};

/**
 * Chạy một chu kỳ thu thập tin tức thủ công
 */
export async function runManualFetchCycle(): Promise<void> {
  console.log('Đang thu thập tin tức thủ công...');

  try {
    // Thu thập tin tức
    const rawNews = await newsCrawler.fetchNews();
    console.log(`Đã thu thập ${rawNews.length} bài tin tức`);

    if (rawNews.length === 0) {
      console.log('Không có tin tức mới. Kết thúc chu kỳ.');
      return;
    }

    // Xử lý dữ liệu bằng NLP
    const processedNews: CrawledContent[] = [];
    for (const news of rawNews) {
      const processed = await nlpProcessor.processContent(news);
      if (processed) {
        processedNews.push(processed);
      }
    }

    console.log(`Đã xử lý ${processedNews.length} bài tin tức`);

    if (processedNews.length === 0) {
      console.log('Không có tin tức nào sau khi xử lý. Kết thúc chu kỳ.');
      return;
    }

    // Tạo nội dung bài viết
    for (const news of processedNews) {
      const article = await contentGenerator.generateArticle(news);
      console.log(`Đã tạo bài viết: ${article.title}`);
    }

    console.log('Chu kỳ thu thập tin tức thủ công đã hoàn tất!');
  } catch (error) {
    console.error('Lỗi khi chạy chu kỳ thu thập tin tức thủ công:', error);
    throw error;
  }
}

export default {
  startNewsAutomation,
  stopNewsAutomation,
  runManualFetchCycle,
  isNewsAutomationRunning
};