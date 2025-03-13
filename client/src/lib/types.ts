// Cryptocurrency price data
export interface CryptoPrice {
  id: number;
  name: string;
  symbol: string;
  price: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  logoUrl: string;
  sparkline: string; // SVG path for the sparkline chart
}

// Article data
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  timeAgo: string;
  publishedAt: string;
}

// Popular article (simplified for sidebar)
export interface PopularArticle {
  id: number;
  title: string;
  timeAgo: string;
}

// Featured news section
export interface FeaturedNews {
  mainArticle: Article;
  secondaryArticles: Article[];
}

// Newsletter subscription
export interface NewsletterSubscription {
  email: string;
  consent: boolean;
}
