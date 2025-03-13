
# ONUS Crypto News Platform

Đây là một nền tảng tin tức về tiền điện tử, cung cấp thông tin về giá, biểu đồ, và các bài viết phân tích về thị trường cryptocurrency.

## Yêu cầu hệ thống và môi trường

### Phần mềm và công cụ cần thiết

- **Node.js**: v20.x hoặc cao hơn
- **npm**: v10.x hoặc cao hơn
- **Git**: v2.30 hoặc cao hơn

### Hệ điều hành được hỗ trợ

- Windows 10/11
- macOS 11 (Big Sur) trở lên
- Ubuntu 20.04 trở lên hoặc các bản phân phối Linux tương đương

### Yêu cầu cấu hình

- **RAM**: Tối thiểu 4GB
- **Dung lượng ổ cứng**: Tối thiểu 1GB không gian trống
- **Kết nối Internet**: Bắt buộc để cài đặt dependencies và fetch dữ liệu cryptocurrency

## Clone dự án

Để clone dự án từ repository, thực hiện lệnh sau:

```bash
git clone https://github.com/yourusername/onus-crypto-news.git
cd onus-crypto-news
```

## Cài đặt dependencies

Cài đặt tất cả các dependencies cần thiết bằng npm:

```bash
npm install
```

Quá trình này có thể mất vài phút tùy thuộc vào tốc độ mạng và hiệu suất máy tính của bạn.

## Cấu hình môi trường

1. Tạo file `.env` trong thư mục gốc của dự án:

```bash
cp .env.example .env  # Nếu có file .env.example
# Hoặc tạo mới file .env nếu không có template
touch .env
```

2. Mở file `.env` và cấu hình các biến môi trường sau:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/crypto_news

# API Keys
OPENAI_API_KEY=your_openai_api_key
COINGECKO_API_KEY=your_coingecko_api_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your_session_secret_key
```

Thay thế các giá trị example bằng thông tin thực tế của bạn.

## Chạy dự án locally

### Khởi động môi trường development

Để chạy dự án ở chế độ development:

```bash
npm run dev
```

Ứng dụng sẽ khởi động và có thể truy cập tại: http://0.0.0.0:5000

### Build và chạy cho môi trường production

Để build và chạy ứng dụng cho môi trường production:

```bash
npm run build
npm run start
```

## Deploy dự án trên Replit

### Chuẩn bị cho deployment

1. Đảm bảo tất cả các thay đổi đã được commit:

```bash
git add .
git commit -m "Prepare for deployment"
```

2. Kiểm tra cấu hình `.replit` để đảm bảo các thông số deployment đã được thiết lập đúng:

```
[deployment]
deploymentTarget = "cloudrun"
run = ["sh", "-c", "npm run dev"]
```

### Tiến hành deploy

1. Mở tab "Deployment" trong giao diện Replit
2. Nhấp vào nút "Deploy" để bắt đầu quá trình deployment
3. Theo dõi tiến trình trong tab Console

### Kiểm tra deployment

Sau khi quá trình deployment hoàn tất, bạn có thể truy cập ứng dụng thông qua URL do Replit cung cấp. URL này thường có dạng: `https://your-project-name.yourusername.repl.co`

## Cấu trúc dự án

```
├── client                   # Frontend React app
│   ├── src                  # Source code
│   └── index.html           # HTML entry point
├── public                   # Public assets
│   └── images               # Image files
├── server                   # Backend Node.js app
│   ├── automation           # Automation scripts
│   ├── api.ts               # API endpoints
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # Route definitions
│   └── storage.ts           # Data storage utilities
├── shared                   # Shared code between client and server
│   └── schema.ts            # Database schema
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Tính năng chính

1. **Hiển thị giá cryptocurrency** - Theo dõi giá và biến động của các loại tiền điện tử phổ biến
2. **Tin tức thị trường** - Cập nhật tin tức mới nhất về thị trường cryptocurrency
3. **Phân tích thị trường** - Các bài viết phân tích chuyên sâu về xu hướng thị trường
4. **Hướng dẫn** - Các hướng dẫn cho người mới bắt đầu với cryptocurrency
5. **Biểu đồ giá** - Biểu đồ trực quan hiển thị biến động giá theo thời gian

## Báo lỗi và hỗ trợ

Nếu bạn gặp vấn đề khi cài đặt hoặc sử dụng ứng dụng:

1. Kiểm tra log lỗi trong terminal
2. Mở Issue trên GitHub repository
3. Liên hệ đội ngũ phát triển qua email: support@example.com

## Cập nhật dự án

Để cập nhật dự án với phiên bản mới nhất:

```bash
git pull origin main
npm install  # Cài đặt dependencies mới (nếu có)
```

## Đóng góp

Chúng tôi luôn hoan nghênh đóng góp cho dự án. Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/your-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some feature'`)
4. Push lên branch (`git push origin feature/your-feature`)
5. Tạo Pull Request

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.
