import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/home/CourseCard';
import ProfileSidebar from '../../components/home/ProfileSideBar';
import PopularCategories from '../../components/home/PopularCategories';
import CategorySlider from '../../components/home/CategorySlider';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popularCourses, setPopularCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);
  const { user, isAuthenticated, getUserRole } = useAuth();

  // Lấy API URL từ biến môi trường
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Hardcoded categories với hình ảnh (chỉ dùng cho fallback UI)
  const categoryImages = {
    'python': 'https://cdn-icons-png.flaticon.com/512/5968/5968350.png',
    'python-tutorials': 'https://cdn-icons-png.flaticon.com/512/5968/5968350.png',
    'web-design': 'https://cdn-icons-png.flaticon.com/512/3244/3244367.png',
    'web-development': 'https://cdn-icons-png.flaticon.com/512/2282/2282188.png',
    'computer-science': 'https://cdn-icons-png.flaticon.com/512/2103/2103794.png',
    'software-engineering': 'https://cdn-icons-png.flaticon.com/512/2115/2115955.png',
    'javascript': 'https://cdn-icons-png.flaticon.com/512/5968/5968292.png',
    'data-science': 'https://cdn-icons-png.flaticon.com/512/2103/2103655.png',
    'internet-of-things': 'https://cdn-icons-png.flaticon.com/512/3094/3094931.png',
    'all': 'https://cdn-icons-png.flaticon.com/512/3037/3037444.png',
  };

  // Default image cho các category không có ảnh
  const defaultCategoryImage = 'https://res.cloudinary.com/drjlezbo7/image/upload/v1763998803/menu_13984545_qzoaog.png';

  // Helper function để extract courses từ response
  const extractCoursesFromResponse = (responseData) => {
    if (!responseData) {
      return [];
    }
    
    // Nếu là array trực tiếp
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    // Nếu là object có items, courses, data
    if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData.items)) {
        return responseData.items;
      }
      if (Array.isArray(responseData.courses)) {
        return responseData.courses;
      }
      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
    }
    
    return [];
  };

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/categories`);

        console.log('Categories API response:', response);
        
        if (response.data && response.data.categories) {
          // Tạo category "All" đầu tiên
          const allCategory = {
            id: 'all',
            name: 'All',
            slug: 'all',
            image: defaultCategoryImage
          };
          
          // Map dữ liệu từ API và thêm hình ảnh
          const apiCategories = response.data.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: categoryImages[cat.slug] || defaultCategoryImage,
            description: cat.description
          }));
          
          // Kết hợp "All" với các category từ API
          setCategories([allCategory, ...apiCategories]);
          console.log('Categories set:', [allCategory, ...apiCategories]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
        // Nếu API lỗi, vẫn hiển thị category "All" để UI không bị trống
        setCategories([{
          id: 'all',
          name: 'All',
          slug: 'all',
          image: defaultCategoryImage
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [API_URL]);

  // Fetch popular courses (top courses) - chạy khi activeCategory thay đổi
  useEffect(() => {
    const fetchPopularCourses = async () => {
      setPopularLoading(true);
      try {
        let url = '';
        
        if (activeCategory === 'All') {
          // Lấy top 4 courses chung
          url = `${API_URL}/courses/top?limit=4`;
        } else {
          // Tìm category object
          const categoryObj = categories.find(cat => cat.name === activeCategory);
          if (categoryObj && categoryObj.id !== 'all') {
            // Lấy top courses theo category
            url = `${API_URL}/courses/category/${categoryObj.id}/top?limit=4`;
          } else {
            // Nếu không tìm thấy category, dùng top chung
            url = `${API_URL}/courses/top?limit=4`;
          }
        }

        console.log('Fetching popular courses from:', url);
        const response = await axios.get(url);
        
        console.log('Popular courses API response:', response);
        
        // Extract courses từ response
        let coursesData = extractCoursesFromResponse(response.data);
        
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          // Transform data để phù hợp với component
          const transformedCourses = coursesData.map(course => {
            // Tìm category name cho course
            const courseCategory = categories.find(cat => cat.id === course.category_id);
            
            return {
              id: course.id,
              title: course.title,
              category: activeCategory === 'All' ? (courseCategory?.name || 'Uncategorized') : activeCategory,
              students: course.student_count || 0,
              rating: 4.5, // Giả sử rating mặc định
              instructor: 'Instructor',
              friends: Math.floor(Math.random() * 300) + 50,
              duration: '12h 30m',
              progress: 0,
              featured: false,
              image: course.thumbnail_url || 
                     (courseCategory ? categoryImages[courseCategory.slug] : defaultCategoryImage) || 
                     defaultCategoryImage,
              price: course.access_type === 'premium' ? 'Premium' : 'Free',
              tags: course.tag || [],
              status: course.status
            };
          });
          
          setPopularCourses(transformedCourses);
        } else {
          console.log('No popular courses found');
          setPopularCourses([]);
        }
      } catch (err) {
        console.error('Error fetching popular courses:', err);
        setPopularCourses([]);
      } finally {
        setPopularLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchPopularCourses();
    }
  }, [activeCategory, categories, API_URL]);

  // Fetch tất cả courses khi category là "All" hoặc fetch courses theo category
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        let url = `${API_URL}/courses`;
        
        // Nếu không phải "All", fetch courses theo category
        if (activeCategory !== 'All') {
          const categoryObj = categories.find(cat => cat.name === activeCategory);
          if (categoryObj && categoryObj.id !== 'all') {
            url = `${API_URL}/courses/by-category/${categoryObj.id}`;
          }
        }

        console.log('Fetching courses from:', url);
        const response = await axios.get(url);
        
        console.log('Courses API response:', response);
        
        // Extract courses từ response
        let coursesData = extractCoursesFromResponse(response.data);
        
        console.log('Processed courses data:', coursesData);
        
        // Transform data để phù hợp với component
        const transformedCourses = coursesData.map(course => {
          // Tìm category name cho course
          const courseCategory = categories.find(cat => cat.id === course.category_id);
          
          return {
            id: course.id,
            title: course.title,
            category: courseCategory?.name || 'Uncategorized',
            students: course.student_count || 0,
            rating: 4.5, // Giả sử rating mặc định
            instructor: 'Instructor',
            friends: Math.floor(Math.random() * 300) + 50,
            duration: '12h 30m',
            progress: 0,
            featured: false,
            image: course.thumbnail_url || 
                   (courseCategory ? categoryImages[courseCategory.slug] : defaultCategoryImage) || 
                   defaultCategoryImage,
            price: course.access_type === 'premium' ? 'Premium' : 'Free',
            status: course.status,
            description: course.description || '',
            tags: course.tag || [],
            updated_at: course.updated_at
          };
        });
        
        // Chỉ hiển thị courses published
        const publishedCourses = transformedCourses.filter(course => course.status === 'published');
        console.log('Published courses:', publishedCourses.length);
        setCourses(publishedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchCourses();
    }
  }, [activeCategory, categories, API_URL]);

  // Dữ liệu hoạt động trong tuần
  const weeklyActivities = [
    { day: 'Mon', hours: 2.5, type: 'learning' },
    { day: 'Tue', hours: 1.8, type: 'practice' },
    { day: 'Wed', hours: 3.2, type: 'learning' },
    { day: 'Thu', hours: 2.0, type: 'project' },
    { day: 'Fri', hours: 4.1, type: 'learning' },
    { day: 'Sat', hours: 1.5, type: 'review' },
    { day: 'Sun', hours: 2.8, type: 'practice' }
  ];

  // Khóa học của bạn
  const myCourses = [
    {
      id: 1,
      title: 'Crawler with Python for Beginners',
      category: 'Python Tutorials',
      progress: 85,
      students: 9530,
      nextLesson: 'State Management',
      timeLeft: '2h 15m'
    },
    {
      id: 2,
      title: 'Ardunio for Beginners',
      category: 'Python',
      progress: 60,
      students: 8500,
      nextLesson: 'Market Analysis',
      timeLeft: '4h 30m'
    },
    {
      id: 3,
      title: 'Machine Learning A-Z™: Hands-On Python & R In Data Science',
      category: 'Computer Science',
      progress: 45,
      students: 15000,
      nextLesson: 'SEO Basics',
      timeLeft: '6h 45m'
    }
  ];

  // Bạn bè đang học
  const friends = [
    { id: 1, name: 'Alex Johnson', course: 'React Native' },
    { id: 2, name: 'Maria Garcia', course: 'UI/UX Design' },
    { id: 3, name: 'Tom Wilson', course: 'Data Science' },
    { id: 4, name: 'Sarah Chen', course: 'Web Development' },
    { id: 5, name: 'Mike Brown', course: 'Cloud Computing' }
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="mx-auto sm:px-5 flex flex-row gap-5 max-w-8xl items-start">
        {/* Frame 1: Courses Section */}
        <div className="flex flex-col md:w-[66vw] w-full pt-4 pb-8 h-full gap-8 overflow-y-auto custom-scrollbar p-0 md:p-2 mt-[5vh]" style={{ maxHeight: '90vh' }}>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start justify-center">
            <h1 className="md:text-[calc(25px_+_2vw)] text-[calc(15px_+_2vw)] font-bold text-gray-900 mb-4 sm:mb-0 md:ml-0 ml-5">
              Invest in your education
            </h1>
          </div>




          {/* Categories Filter */}
          <CategorySlider 
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          
          {/* Modular Ratings - Luôn hiển thị popular courses */}
          <PopularCategories 
            courses={popularCourses} 
            loading={popularLoading}
            activeCategory={activeCategory}
            showTitle={activeCategory === 'All' ? 'Top Courses' : `Top in ${activeCategory}`}
          />

          {/* Courses Grid */}
          <div className={`${coursesLoading ||  courses.length === 0?'space-y-6 ':'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
            {coursesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No courses found in "{activeCategory}" category.</p>
                <button 
                  onClick={() => setActiveCategory('All')}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all courses
                </button>
              </div>
            ) : (                 
              courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>

        {/* Frame 2: Profile Sidebar */}
        <div className="flex-1 flex h-screen justify-center items-center md:flex hidden">
          <ProfileSidebar 
            weeklyActivities={weeklyActivities}
            myCourses={myCourses}
            friends={friends}
            user={user}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
      
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.3);
          border-radius: 10px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.2);
          border-radius: 10px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.3);
          background-clip: padding-box;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE, Edge */
          scrollbar-width: none;     /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Home;