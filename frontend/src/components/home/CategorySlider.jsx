import { useRef, useState, useEffect } from "react";

export default function CategorySlider({ categories, activeCategory, setActiveCategory }) {
  const scrollContainerRef = useRef(null);
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  // Kiểm tra scroll position để hiển thị blur
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // Hiển thị blur bên trái nếu đã scroll sang phải
      setShowLeftBlur(scrollLeft > 10);
      
      // Hiển thị blur bên phải nếu còn content để scroll
      setShowRightBlur(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Thêm event listener cho scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Kiểm tra ngay khi mount
      checkScroll();
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
      };
    }
  }, [categories]); // Re-check khi categories thay đổi

  // Scroll functions (tùy chọn)
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      {/* Left blur overlay */}
      {showLeftBlur && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Right blur overlay */}
      {showRightBlur && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Optional navigation buttons - chỉ hiện trên desktop */}
      <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={scrollLeft}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={scrollRight}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scroll container với blur effect */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-6
                   snap-x snap-mandatory scroll-pl-6
                   [-ms-overflow-style:'none'] [scrollbar-width:'none']
                   [&::-webkit-scrollbar]:hidden
                   relative z-0"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-200
              snap-start relative
              ${
                activeCategory === category.name
                  ? "bg-[#333] text-white border-white shadow-md z-10"
                  : "bg-[#EFE9E3] text-gray-700 border-gray-300 hover:border-gray-500 hover:shadow-sm"
              }`}
            style={{
              // Thêm backdrop-filter cho blur effect khi bị che
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
          >
            <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0
              ${activeCategory === category.name ? 'bg-white/20' : 'bg-white'}`}>
              <img
                src={category.image}
                alt={category.name}
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23ccc"/></svg>';
                }}
              />
            </div>
            <span className="font-semibold whitespace-nowrap text-sm">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile scroll hint */}
      <div className="text-center mt-2 md:hidden">
        <p className="text-xs text-gray-500 animate-pulse">← Kéo để xem thêm →</p>
      </div>
    </div>
  );
}