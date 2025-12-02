import { useState, useEffect, useCallback, useRef } from 'react';
import CourseItem from '../../components/course/CourseItem';

const CourseSkeleton = () => (
  <div className="bg-cream-50 rounded-2xl shadow-lg overflow-hidden border border-cream-200 animate-pulse">
    <div className="bg-gradient-to-r from-cream-100 to-cream-200 h-48 w-full" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-cream-100 rounded-full w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-cream-100 rounded-full w-full" />
        <div className="h-4 bg-cream-100 rounded-full w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-9 bg-cream-100 rounded-full w-24" />
        <div className="h-5 bg-cream-100 rounded-full w-32" />
      </div>
    </div>
  </div>
);

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [currentMode, setCurrentMode] = useState('search');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const observer = useRef();
  const containerRef = useRef();
  const scrollIndicatorRef = useRef();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const TAKE = 20;

  // Load danh mục
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(r => r.json())
      .then(data => {
        setCategories([{ id: '', name: 'Tất cả danh mục' }, ...data.categories]);
      })
      .catch(console.error);
  }, [API_URL]);

  // Fetch API
  const fetchCourses = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setCourses([]);
      setSkip(0);
      setHasMore(true);
    } else if (!hasMore || loadingMore) {
      return;
    } else {
      setLoadingMore(true);
    }

    try {
      let url = '';
      const params = new URLSearchParams({
        take: TAKE.toString(),
        skip: reset ? '0' : skip.toString(),
      });

      if (searchTerm.trim() && selectedCategory) {
        setCurrentMode('search');
        params.append('search', searchTerm.trim());
        params.append('category_id', selectedCategory);
        params.append('sort', 'latest');
        url = `${API_URL}/searching?${params}`;
      } else if (searchTerm.trim()) {
        setCurrentMode('search');
        params.append('search', searchTerm.trim());
        params.append('sort', 'latest');
        url = `${API_URL}/searching?${params}`;
      } else if (selectedCategory) {
        setCurrentMode('category');
        url = `${API_URL}/courses/by-category/${selectedCategory}?${params}`;
      } else {
        setCurrentMode('search');
        params.append('sort', 'latest');
        url = `${API_URL}/searching?${params}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Lỗi server');

      const data = await res.json();
      
      let newItems = [];
      if (currentMode === 'search') {
        newItems = data.items || data.courses || [];
      } else if (currentMode === 'category') {
        newItems = data.courses || data.items || [];
      }

      if (!reset) {
        setTimeout(() => {
          setCourses(prev => [...prev, ...newItems]);
        }, 300);
      } else {
        setCourses(newItems);
      }
      
      setSkip(prev => prev + newItems.length);
      setHasMore(newItems.length === TAKE);
    } catch (err) {
      console.error('Fetch error:', err);
      if (reset) setCourses([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingMore(false);
      }, 300);
    }
  }, [API_URL, searchTerm, selectedCategory, skip, hasMore, loadingMore, currentMode]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  // Infinite scroll
  const lastCourseRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setTimeout(() => {
            fetchCourses(false);
          }, 200);
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, fetchCourses]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
      
      setIsScrolling(true);
      clearTimeout(scrollIndicatorRef.current);
      scrollIndicatorRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Format số lượng
  const formatCourseCount = () => {
    if (courses.length === 0) return '0';
    if (courses.length < 1000) return courses.length.toString();
    return `${(courses.length / 1000).toFixed(1)}k`;
  };

  // Scroll to top
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <div className="bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen">
      {/* Scroll progress bar - màu vintage */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-cream-100">
        <div 
          className="h-full bg-gradient-to-r from-teal-300 via-rose-300 to-amber-300 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 h-[calc(100vh)] overflow-y-auto scroll-smooth pb-24">
        {/* Header với phong cách vintage tươi sáng */}
        <div className="flex  flex-col sm:sticky top-4 z-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 border border-cream-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-rose-100 rounded-lg flex items-center justify-center border border-cream-300">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-rose-500 bg-clip-text text-transparent">
                Khóa Học
              </h1>
            </div>
            
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-gray-700 rounded-lg border border-cream-300 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
            {/* Search input với style vintage */}
            <div className="relative flex-1 md:max-w-lg">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-12 py-4 text-lg bg-white text-gray-800 placeholder-gray-400 border-2 border-cream-300 rounded-2xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-300 shadow-sm hover:shadow-md hover:border-teal-300"
              />
              <svg className="absolute left-5 top-5 w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-5 w-6 h-6 text-teal-500 hover:text-teal-600 transition-colors duration-200"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category select với style vintage */}
            <div className="relative w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-5 py-4 bg-white text-gray-800 border-2 border-cream-300 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-5 pointer-events-none">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="mt-6 pt-6 border-t border-cream-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-rose-500 bg-clip-text text-transparent">
                  {formatCourseCount()}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">khóa học</span>
                  {searchTerm && (
                    <span className="ml-2">
                      cho <span className="font-semibold text-gray-800">"{searchTerm}"</span>
                    </span>
                  )}
                </div>
              </div>
              
              {selectedCategory && categories.find(c => c.id === selectedCategory) && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-50 to-rose-50 text-teal-700 rounded-lg font-medium border border-teal-200">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-teal-100 transition-colors text-teal-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div 
          ref={containerRef}
          className="relative"
        >
          {/* Grid courses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CourseSkeleton />
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <div
                  key={course.id || index}
                  ref={index === courses.length - 3 ? lastCourseRef : null}
                  className="animate-fadeInUp"
                  style={{
                    animationDelay: `${(index % 20) * 0.05}s`,
                    opacity: loadingMore && index >= courses.length - TAKE ? 0.7 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <CourseItem course={course} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white to-cream-50 rounded-3xl mb-8 border border-cream-300 shadow-sm">
                  <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">Không tìm thấy khóa học</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Hãy thử từ khóa khác hoặc chọn danh mục khác để khám phá thêm khóa học
                </p>
              </div>
            )}
          </div>

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-12 animate-fadeIn">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-teal-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>
                <p className="text-teal-500 font-medium animate-pulse">Đang tải thêm khóa học...</p>
              </div>
            </div>
          )}

          {/* End of list message */}
          {!hasMore && courses.length > 0 && !loading && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-50 to-rose-50 rounded-2xl mb-6 border border-teal-200 shadow-sm">
                <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                Bạn đã xem hết <span className="text-teal-500">{courses.length}</span> khóa học
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Tìm kiếm để khám phá thêm khóa học khác
              </p>
            </div>
          )}
        </div>

        {/* Scroll to top button - kiểu dáng vintage */}
        {scrollProgress > 10 && (
          <button
            onClick={scrollToTop}
            className={`fixed right-8 bottom-8 w-14 h-14 bg-gradient-to-br from-teal-400 to-rose-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-teal-200 hover:scale-110 z-50 border border-teal-300 ${
              isScrolling ? 'opacity-100' : 'opacity-90 hover:opacity-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        /* Custom scrollbar vintage */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #fef3c7;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #5eead4, #f9a8d4);
          border-radius: 4px;
          border: 2px solid #fef3c7;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2dd4bf, #f472b6);
        }
        /* Selection color */
        ::selection {
          background-color: rgba(45, 212, 191, 0.3);
          color: #0d9488;
        }
      `}</style>

      {/* Thêm gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-50/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cream-100 to-transparent"></div>
      </div>
    </div>
  );
};

export default CourseList;