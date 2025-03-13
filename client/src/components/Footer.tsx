import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Send, 
  Youtube, 
  MessageSquare,
  MapPin,
  Mail,
  Phone
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/images/onus/logo_main.png" alt="ONUS" className="h-10 mr-2" />
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Nguồn tin tức tiền điện tử hàng đầu Việt Nam. Cập nhật tin tức, phân tích và hướng dẫn về Bitcoin, Ethereum và các tiền điện tử khác.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://telegram.org" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <Send size={18} />
              </a>
              <a href="https://youtube.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                <Youtube size={18} />
              </a>
              <a href="https://discord.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Danh Mục</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/bitcoin">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Bitcoin</div>
                </Link>
              </li>
              <li>
                <Link href="/category/ethereum">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Ethereum</div>
                </Link>
              </li>
              <li>
                <Link href="/category/altcoin">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Altcoin</div>
                </Link>
              </li>
              <li>
                <Link href="/category/blockchain">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Blockchain</div>
                </Link>
              </li>
              <li>
                <Link href="/category/nft">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">NFT</div>
                </Link>
              </li>
              <li>
                <Link href="/category/defi">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">DeFi</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Kết</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/gioi-thieu">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Giới Thiệu</div>
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Điều Khoản Sử Dụng</div>
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Chính Sách Bảo Mật</div>
                </Link>
              </li>
              <li>
                <Link href="/quang-cao">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Quảng Cáo</div>
                </Link>
              </li>
              <li>
                <Link href="/lien-he">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Liên Hệ</div>
                </Link>
              </li>
              <li>
                <Link href="/tuyen-dung">
                  <div className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Cơ Hội Việc Làm</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="text-gray-400 mt-1 mr-3 h-4 w-4 flex-shrink-0" />
                <span className="text-gray-400 text-sm">Tòa nhà VietCrypto, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-gray-400 mr-3 h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@cryptoviet.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  info@cryptoviet.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="text-gray-400 mr-3 h-4 w-4 flex-shrink-0" />
                <a href="tel:+84901234567" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +84 90 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ONUS. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
