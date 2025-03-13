import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import { ProcessedArticle } from './types';
import deepseek from 'deepseek-api';

// Định nghĩa các biến môi trường cho các dịch vụ
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';CCESS_KEY || '';

export class ImageService {
  unsplash: any;
  deepseek: any;

  constructor() {
    this.unsplash = createApi({
      accessKey: UNSPLASH_ACCESS_KEY,
      fetch: fetch as any,
    });
    this.deepseek = new DeepSeekAPI({
      apiKey: DEEPSEEK_API_KEY,
    });
  }

  /**
   * Tạo hình ảnh mới sử dụng DALL-E API của OpenAI dựa trên nội dung bài báo
   */
  async generateImageForArticle(article: any): Promise<string | null> {
    try {
      if (!DEEPSEEK_API_KEY) {
        console.log('DEEPSEEK_API_KEY không được cấu hình, không thể tạo hình ảnh.');
        return null;
      }

      // Tạo prompt cho DeepSeek dựa trên nội dung bài viết
      const prompt = `Create a professional, journalistic image for a cryptocurrency article titled "${article.title}". The image should be appropriate for a financial news website, with a clean, modern style.`;

      console.log(`Đang tạo hình ảnh AI cho bài viết: ${article.title}`);

      const response = await this.deepseek.images.generate({
        prompt: prompt,
        n: 1, 
        size: '1024x1024',
        format: 'url',
      });

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].url;

        // Lưu hình ảnh vào thư mục local (tùy chọn)
        if (imageUrl) {
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.buffer();

            // Tạo thư mục nếu chưa tồn tại
            const imageDirPath = path.join(process.cwd(), 'public', 'images', 'generated');
            await fs.ensureDir(imageDirPath);

            // Tạo tên file dựa trên tiêu đề bài viết
            const safeFileName = article.title
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .substring(0, 50);
            const fileName = `${safeFileName}-${Date.now()}.png`;
            const filePath = path.join(imageDirPath, fileName);

            // Lưu hình ảnh
            await fs.writeFile(filePath, imageBuffer);

            // Trả về đường dẫn tương đối để lưu vào cơ sở dữ liệu
            return `/images/generated/${fileName}`;
          } catch (error) {
            console.error('Lỗi khi lưu hình ảnh được tạo:', error);
            return imageUrl; // Trả về URL gốc nếu không thể lưu
          }
        }

        return imageUrl;
      }

      return null;
    } catch (error) {
      console.error('Lỗi khi tạo hình ảnh với AI:', error);
      return null;
    }
  }

  /**
   * Tìm kiếm hình ảnh từ Unsplash dựa trên từ khóa
   */
  async searchImageFromUnsplash(article: ProcessedArticle): Promise<string | null> {
    try {
      if (!UNSPLASH_ACCESS_KEY) {
        console.log('UNSPLASH_ACCESS_KEY không được cấu hình, không thể tìm hình ảnh từ Unsplash.');
        return null;
      }

      // Tạo query từ tiêu đề hoặc từ khóa trong bài viết
      const query = article.title;

      console.log(`Đang tìm kiếm hình ảnh Unsplash cho: ${query}`);

      const result = await this.unsplash.search.getPhotos({
        query,
        page: 1,
        perPage: 1,
        orientation: 'landscape',
      });

      if (result.response && result.response.results.length > 0) {
        const photo = result.response.results[0];
        return photo.urls.regular;
      }

      return null;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm hình ảnh từ Unsplash:', error);
      return null;
    }
  }

  /**
   * Trích xuất hình ảnh từ nguồn tham khảo nếu có
   */
  extractImageFromReferences(article: ProcessedArticle): string | null {
    // Kiểm tra xem bài viết có nguồn tham khảo không
    if (article.references && article.references.length > 0) {
      // Lọc các nguồn có hình ảnh
      const referencesWithImages = article.references.filter(ref => ref.image_url && ref.image_url.trim() !== '');

      if (referencesWithImages.length > 0) {
        // Lấy một nguồn ngẫu nhiên có hình ảnh
        const randomIndex = Math.floor(Math.random() * referencesWithImages.length);
        const selectedReference = referencesWithImages[randomIndex];

        // Lưu thông tin nguồn để ghi chú
        article.imageCredits = {
          name: selectedReference.source || 'Unknown source',
          link: selectedReference.url || ''
        };

        return selectedReference.image_url || null;
      }
    }

    return null;
  }

  /**
   * Tìm hoặc tạo hình ảnh cho bài viết
   */
  async getImageForArticle(article: ProcessedArticle): Promise<string | null> {
    console.log(`Đang xử lý hình ảnh cho bài viết: ${article.title}`);

    try {
      // Nếu bài viết đã có hình ảnh, không cần xử lý thêm
      if (article.imageUrl && article.imageUrl.trim() !== '') {
        console.log('Bài viết đã có hình ảnh sẵn.');
        return article.imageUrl;
      }

      let imageUrl: string | null = null;

      // Ưu tiên 1: Tạo hình ảnh mới với AI (nếu có cấu hình API key)
      if (OPENAI_API_KEY) {
        console.log('Đang thử tạo hình ảnh với AI...');
        imageUrl = await this.generateImageForArticle(article);
        if (imageUrl) {
          console.log('Đã tạo thành công hình ảnh mới với AI.');
          article.imageSource = 'generated';
          return imageUrl;
        }
      }

      // Ưu tiên 2: Trích xuất hình ảnh từ nguồn tham khảo
      console.log('Đang thử trích xuất hình ảnh từ nguồn tham khảo...');
      imageUrl = this.extractImageFromReferences(article);
      if (imageUrl) {
        console.log('Đã trích xuất thành công hình ảnh từ nguồn tham khảo.');
        article.imageSource = 'reference';
        return imageUrl;
      }

      // Ưu tiên 3: Tìm kiếm hình ảnh từ Unsplash
      if (UNSPLASH_ACCESS_KEY) {
        console.log('Đang thử tìm kiếm hình ảnh từ Unsplash...');
        imageUrl = await this.searchImageFromUnsplash(article);
        if (imageUrl) {
          console.log('Đã tìm kiếm thành công hình ảnh từ Unsplash.');
          article.imageSource = 'unsplash';
          return imageUrl;
        }
      }

      // Không tìm thấy hoặc tạo được hình ảnh
      console.log('Không thể tìm thấy hoặc tạo hình ảnh cho bài viết.');
      return null;
    } catch (error) {
      console.error('Lỗi khi xử lý hình ảnh cho bài viết:', error);
      return null;
    }
  }
}

// Export the function that contentGenerator.ts is trying to import
export async function getImageForArticle(article: ProcessedArticle): Promise<string | null> {
  const imageService = new ImageService();
  try {
    // First try to generate with AI
    const aiImage = await imageService.generateImageForArticle(article);
    if (aiImage) return aiImage;

    // Fall back to Unsplash
    return await imageService.searchImageFromUnsplash(article);
  } catch (error) {
    console.error('Error getting image for article:', error);
    return null;
  }
}