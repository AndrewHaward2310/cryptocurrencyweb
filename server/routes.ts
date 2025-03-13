import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, insertArticleSchema } from "@shared/schema";
import { getCryptoPrices } from "./api";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { startNewsAutomation, stopNewsAutomation, runManualFetchCycle } from "./automation/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // Get cryptocurrency prices
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      const prices = await getCryptoPrices();
      res.json(prices);
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrency prices" });
    }
  });

  // Get latest news
  app.get("/api/news/latest", async (req, res) => {
    try {
      let limit = 10;
      let offset = 0;
      
      // Parse query parameters
      if (req.query.limit) {
        limit = parseInt(req.query.limit as string);
      }
      if (req.query.offset) {
        offset = parseInt(req.query.offset as string);
      }
      
      // Get articles from storage
      const articles = await storage.getArticles(limit, offset);
      
      // Format for frontend
      const formattedArticles = articles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image_url,
        category: article.category,
        author: article.author,
        timeAgo: getTimeAgo(article.published_at),
        publishedAt: article.published_at.toISOString()
      }));
      
      res.json(formattedArticles);
    } catch (error) {
      console.error("Failed to fetch latest news:", error);
      res.status(500).json({ message: "Failed to fetch latest news" });
    }
  });

  // Get featured news for the hero banner
  app.get("/api/news/featured", async (req, res) => {
    try {
      const featuredArticles = await storage.getFeaturedArticles();
      
      if (featuredArticles.length === 0) {
        return res.status(404).json({ message: "No featured articles found" });
      }
      
      // Format for frontend
      const formattedArticles = featuredArticles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image_url,
        category: article.category,
        author: article.author,
        timeAgo: getTimeAgo(article.published_at),
        publishedAt: article.published_at.toISOString()
      }));
      
      // Structure for the hero banner (1 main + 2 secondary)
      const response = {
        mainArticle: formattedArticles[0],
        secondaryArticles: formattedArticles.slice(1, 3)
      };
      
      res.json(response);
    } catch (error) {
      console.error("Failed to fetch featured news:", error);
      res.status(500).json({ message: "Failed to fetch featured news" });
    }
  });

  // Get popular articles
  app.get("/api/news/popular", async (req, res) => {
    try {
      let limit = 5;
      
      // Parse query parameters
      if (req.query.limit) {
        limit = parseInt(req.query.limit as string);
      }
      
      const popularArticles = await storage.getPopularArticles(limit);
      
      // Format for frontend
      const formattedArticles = popularArticles.map(article => ({
        id: article.id,
        title: article.title,
        timeAgo: getTimeAgo(article.published_at)
      }));
      
      res.json(formattedArticles);
    } catch (error) {
      console.error("Failed to fetch popular articles:", error);
      res.status(500).json({ message: "Failed to fetch popular articles" });
    }
  });

  // Get articles by category
  app.get("/api/news/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      
      if (!category) {
        return res.status(400).json({ message: "Category parameter is required" });
      }
      
      const articles = await storage.getArticlesByCategory(category);
      
      // Format for frontend
      const formattedArticles = articles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image_url,
        category: article.category,
        author: article.author,
        timeAgo: getTimeAgo(article.published_at),
        publishedAt: article.published_at.toISOString()
      }));
      
      res.json(formattedArticles);
    } catch (error) {
      console.error("Failed to fetch articles by category:", error);
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });

  // Get article by ID
  app.get("/api/news/article/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment view count
      await storage.incrementArticleViews(id);
      
      // Format for frontend
      const formattedArticle = {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image_url,
        category: article.category,
        author: article.author,
        timeAgo: getTimeAgo(article.published_at),
        publishedAt: article.published_at.toISOString()
      };
      
      res.json(formattedArticle);
    } catch (error) {
      console.error("Failed to fetch article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Create a new article
  app.post("/api/news/article", async (req, res) => {
    try {
      // Validate input
      const articleSchema = z.object({
        title: z.string().min(10, "Title must be at least 10 characters"),
        excerpt: z.string().min(20, "Excerpt must be at least 20 characters"),
        content: z.string().min(50, "Content must be at least 50 characters"),
        category: z.string(),
        author: z.string().min(3, "Author name must be at least 3 characters"),
        imageUrl: z.string().optional()
      });
      
      const result = articleSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Create article
      const articleData = {
        ...result.data,
        image_url: result.data.imageUrl || "/images/onus/feature.jpg", // Use default if not provided
      };
      
      const article = await storage.createArticle(articleData);
      
      // Format for frontend
      const formattedArticle = {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image_url,
        category: article.category,
        author: article.author,
        timeAgo: getTimeAgo(article.published_at),
        publishedAt: article.published_at.toISOString()
      };
      
      res.status(201).json(formattedArticle);
    } catch (error) {
      console.error("Failed to create article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Subscribe to newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      // Validate input
      const newsletterSchema = z.object({
        email: z.string().email(),
        consent: z.boolean().refine(val => val === true, {
          message: "Consent is required"
        })
      });
      
      const result = newsletterSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const { email } = result.data;
      
      // Check if already subscribed
      const isSubscribed = await storage.isEmailSubscribed(email);
      
      if (isSubscribed) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      // Create subscription
      const newsletter = await storage.subscribeToNewsletter({ email });
      
      res.status(201).json({ 
        message: "Successfully subscribed to newsletter",
        email: newsletter.email
      });
    } catch (error) {
      console.error("Failed to subscribe to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // API endpoints cho hệ thống tự động thu thập tin tức
  app.post("/api/automation/start", (req, res) => {
    try {
      startNewsAutomation();
      res.json({ message: "Hệ thống tự động thu thập tin tức đã được khởi động" });
    } catch (error) {
      console.error("Lỗi khi khởi động hệ thống tự động:", error);
      res.status(500).json({ message: "Không thể khởi động hệ thống tự động" });
    }
  });
  
  app.post("/api/automation/stop", (req, res) => {
    try {
      stopNewsAutomation();
      res.json({ message: "Hệ thống tự động thu thập tin tức đã được dừng" });
    } catch (error) {
      console.error("Lỗi khi dừng hệ thống tự động:", error);
      res.status(500).json({ message: "Không thể dừng hệ thống tự động" });
    }
  });
  
  app.post("/api/automation/fetch-now", async (req, res) => {
    try {
      // Chạy quá trình thu thập tin tức ngay lập tức
      await runManualFetchCycle();
      res.json({ message: "Đã chạy chu kỳ thu thập tin tức thành công" });
    } catch (error) {
      console.error("Lỗi khi thu thập tin tức:", error);
      res.status(500).json({ message: "Không thể thu thập tin tức" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} năm trước`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} tháng trước`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} ngày trước`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} giờ trước`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} phút trước`;
  }
  
  if (seconds < 10) return "vừa xong";
  
  return `${Math.floor(seconds)} giây trước`;
}
