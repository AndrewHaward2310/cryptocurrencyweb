
/**
 * Kiểu dữ liệu cho dữ liệu thu thập được từ nguồn tin tức
 */
export interface RawContent {
  title: string;
  content: string;
  summary?: string;
  url: string;
  source: string;
  publishedAt: Date;
  author?: string;
  imageUrl?: string;
  category?: string;
  engagement?: {
    views?: number;
    comments?: number;
    shares?: number;
    likes?: number;
  };
}

/**
 * Kiểu dữ liệu cho dữ liệu đã qua xử lý NLP
 */
export interface CrawledContent extends RawContent {
  keywords: string[];
  relevanceScore: number;
  sentiment: number;
  category: string;
  entities?: {
    organizations: string[];
    persons: string[];
    locations: string[];
    misc: string[];
  };
}

/**
 * Kiểu dữ liệu cho bài viết được tạo ra
 */
export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: string;
  originalSources: string[];
}

/**
 * Kiểu dữ liệu cho cấu hình hệ thống
 */
export interface SystemConfig {
  crawling: {
    maxArticlesPerSource: number;
    sources: {
      name: string;
      url: string;
      type: 'rss' | 'html' | 'api';
    }[];
  };
  processing: {
    minRelevanceScore: number;
    minContentLength: number;
  };
  publishing: {
    articlesPerDay: number;
    publishTime: string; // Format "HH:MM"
  };
}

/**
 * Kiểu dữ liệu cho nội dung hình ảnh
 */
export interface ImageContent {
  url: string;
  alt: string;
  source?: string;
  license?: string;
}
// Định nghĩa các kiểu dữ liệu cho hệ thống tự động thu thập tin tức
export interface CrawledContent {
  title: string;
  content: string;
  source: string;
  url: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface ProcessedNewsItem {
  title: string;
  content: string;
  source: string;
  url: string;
  imageUrl?: string;
  timestamp: Date;
  category: string;
  relevanceScore: number;
  extractedKeywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  imageUrl?: string;
}

export interface NewsAutomationConfig {
  schedule: {
    fetchInterval: number; // in milliseconds
    publishTime: string;   // time of day to publish, e.g., "08:00"
  };
  sources: {
    name: string;
    url: string;
    trustScore: number; // 0-10
  }[];
  nlp: {
    minRelevanceScore: number; // 0-10
    minContentLength: number;
  };
  publishing: {
    articlesPerDay: number;
    autoPrioritize: boolean;
    defaultCategory: string;
  };
}
