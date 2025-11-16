import Navigation_PC from "./components/Navigation_PC";
import Navigation_Mobile from "./components/Navigation_Mobile";
import Home from "./pages/Home";

function App() {
  return (
    // LỚP RESPONSIVE CHO LAYOUT CHÍNH:
    // - Mobile (mặc định): flex-col (xếp chồng Header và Content)
    // - PC (từ md trở lên): md:flex-row (Sidebar bên trái, Content bên phải)
    // 
    // Các lớp khác của bạn cũng được áp dụng theo tiền tố md:
    <div className="flex flex-col md:flex-row md:items-center min-h-screen md:h-screen md:gap-[30px] md:px-5 bg-[#F9F8F6]">
      
      {/* === PHẦN ĐIỀU HƯỚNG (NAVIGATION) === */}

      {/* 1. NAV MOBILE (Header Ngang)
        - 'block': Hiện thị mặc định (trên mobile)
        - 'md:hidden': Ẩn đi khi màn hình từ 'md' (768px) trở lên
        - Thêm p-2 để tạo khoảng đệm cho header trên mobile
      */}
      <div className="block md:hidden w-full p-2">
        <Navigation_Mobile />
      </div>

      {/* 2. NAV PC (Sidebar Dọc)
        - 'hidden': Ẩn mặc định (trên mobile)
        - 'md:block': Hiện thị (dưới dạng block) khi màn hình từ 'md' trở lên
      */}
      <div className="hidden md:block">
        <Navigation_PC />
      </div>

      {/* === PHẦN NỘI DUNG CHÍNH (HOME) === */}

      {/* - 'flex-1': Lấp đầy không gian còn lại (theo chiều dọc trên mobile, chiều ngang trên PC)
        - 'w-full': Đảm bảo nội dung luôn rộng 100%
        - 'px-2 md:px-0': Thêm padding ngang cho nội dung trên mobile, reset về 0 trên PC
        - 'md:h-[96vh]': Trên PC, đặt chiều cao khớp với Sidebar (96vh từ mã trước)
        - 'md:overflow-y-auto': Cho phép cuộn nội dung 'Home' nếu nó dài (chỉ trên PC)
      */}
      <main className="flex-1 w-full px-2 md:px-0 md:h-[96vh] md:overflow-y-auto">
        <Home />
      </main>
    </div>
  );
}

export default App;