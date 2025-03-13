import { useState } from "react";
import { Link } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/lib/hooks";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMobile();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      toast({
        title: "Tìm kiếm trống",
        description: "Vui lòng nhập từ khóa để tìm kiếm",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Đang tìm kiếm",
      description: `Tìm kiếm cho: "${searchQuery}"`,
    });
    // In a real app, this would navigate to search results page
    setSearchQuery("");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center">
                <img 
                  src="/images/onus/logo_main.png" 
                  alt="ONUS" 
                  className="h-10 mr-2" 
                />
              </div>
            </Link>
            <div className="hidden md:block ml-2 text-sm text-gray-500">
              Tin tức tiền điện tử hàng đầu Việt Nam
            </div>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <div className="text-gray-900 hover:text-primary transition duration-150 font-medium">
                Trang Chủ
              </div>
            </Link>
            <Link href="/tin-tuc">
              <div className="text-gray-900 hover:text-primary transition duration-150">
                Tin Tức
              </div>
            </Link>
            <Link href="/phan-tich">
              <div className="text-gray-900 hover:text-primary transition duration-150">
                Phân Tích
              </div>
            </Link>
            <Link href="/huong-dan">
              <div className="text-gray-900 hover:text-primary transition duration-150">
                Hướng Dẫn
              </div>
            </Link>
            <Link href="/lien-he">
              <div className="text-gray-900 hover:text-primary transition duration-150">
                Liên Hệ
              </div>
            </Link>
          </nav>

          {/* Mobile menu button */}
          {/* Secondary actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-primary text-xs">
                Cộng tác viên
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Nav with Search (Desktop) */}
      <div className="border-t border-gray-100 py-2 bg-blue-50 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold text-gray-900">XEM NHANH:</span>
            <Link href="/category/bitcoin">
              <div className="text-xs hover:text-primary cursor-pointer">Bitcoin</div>
            </Link>
            <Link href="/category/ethereum">
              <div className="text-xs hover:text-primary cursor-pointer">Ethereum</div>
            </Link>
            <Link href="/category/altcoins">
              <div className="text-xs hover:text-primary cursor-pointer">Altcoins</div>
            </Link>
            <Link href="/category/nfts">
              <div className="text-xs hover:text-primary cursor-pointer">NFTs</div>
            </Link>
            <Link href="/category/blockchain">
              <div className="text-xs hover:text-primary cursor-pointer">Blockchain</div>
            </Link>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              className="pl-10 pr-4 py-1 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Search Form */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-gray-100 py-3 px-4 bg-blue-50">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3 py-2">
              <Link href="/">
                <div className="text-gray-900 hover:text-primary transition duration-150 font-medium py-2 border-b border-gray-100">
                  Trang Chủ
                </div>
              </Link>
              <Link href="/tin-tuc">
                <div className="text-gray-900 hover:text-primary transition duration-150 py-2 border-b border-gray-100">
                  Tin Tức
                </div>
              </Link>
              <Link href="/phan-tich">
                <div className="text-gray-900 hover:text-primary transition duration-150 py-2 border-b border-gray-100">
                  Phân Tích
                </div>
              </Link>
              <Link href="/huong-dan">
                <div className="text-gray-900 hover:text-primary transition duration-150 py-2 border-b border-gray-100">
                  Hướng Dẫn
                </div>
              </Link>
              <Link href="/lien-he">
                <div className="text-gray-900 hover:text-primary transition duration-150 py-2">
                  Liên Hệ
                </div>
              </Link>
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-4">
                <span className="text-xs font-semibold text-gray-900">XEM NHANH:</span>
                <Link href="/category/bitcoin">
                  <div className="text-xs hover:text-primary cursor-pointer">Bitcoin</div>
                </Link>
                <Link href="/category/ethereum">
                  <div className="text-xs hover:text-primary cursor-pointer">Ethereum</div>
                </Link>
                <Link href="/category/altcoins">
                  <div className="text-xs hover:text-primary cursor-pointer">Altcoins</div>
                </Link>
                <Link href="/category/nfts">
                  <div className="text-xs hover:text-primary cursor-pointer">NFTs</div>
                </Link>
                <Link href="/category/blockchain">
                  <div className="text-xs hover:text-primary cursor-pointer">Blockchain</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
