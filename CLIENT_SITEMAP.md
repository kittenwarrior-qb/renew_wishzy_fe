# Sitemap Trang Client - Wishzy

## Cấu trúc tổng quan

```
/[locale]/
│
├── 🏠 Trang chủ
│   └── / (Homepage)
│
├── 📄 Giới thiệu
│   └── /about
│
├── 🔐 Xác thực (Authentication)
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/forgot-password
│   ├── /auth/reset-password
│   └── /auth/verify-email
│
├── 🎓 Khóa học
│   ├── /course-detail/[id] (Chi tiết khóa học)
│   └── /search (Tìm kiếm khóa học)
│
├── 📚 Học tập (Learning)
│   ├── /learning/[courseId] (Trang khóa học đang học)
│   └── /learning/[courseId]/[lectureId] (Chi tiết bài giảng)
│
├── 📝 Bài kiểm tra (Quiz)
│   ├── /quiz (Danh sách quiz)
│   ├── /quiz/[quizId] (Chi tiết quiz)
│   └── /quiz/[quizId]/result (Kết quả quiz)
│
├── 📰 Blog
│   ├── /blog (Danh sách bài viết)
│   └── /blog/[blogId] (Chi tiết bài viết)
│
├── 🛒 Giỏ hàng & Thanh toán
│   ├── /cart (Giỏ hàng)
│   ├── /checkout (Thanh toán)
│   ├── /checkout/success (Thanh toán thành công)
│   ├── /payment/callback (Callback từ payment gateway)
│   └── /payment-result (Kết quả thanh toán)
│
├── 👤 Người dùng
│   ├── /profile (Hồ sơ cá nhân)
│   │   ├── ?tab=profile (Thông tin cá nhân)
│   │   ├── ?tab=my-learning (Khóa học của tôi)
│   │   └── ?tab=wishlist (Khóa học yêu thích)
│   ├── /dashboard (Bảng điều khiển)
│   └── /certificates/[enrollmentId] (Chứng chỉ)
│
└── 👨‍🏫 Giảng viên (Instructor)
    ├── /instructor (Tổng quan)
    ├── /instructor/revenue (Quản lý doanh thu)
    ├── /instructor/courses (Danh sách khóa học)
    ├── /instructor/courses/create (Tạo khóa học)
    ├── /instructor/courses/[id] (Chi tiết khóa học)
    ├── /instructor/courses/edit/[id] (Chỉnh sửa khóa học)
    ├── /instructor/courses/sales (Quản lý sale)
    ├── /instructor/course/[id] (Chi tiết khóa học - alt route)
    ├── /instructor/user/students (Quản lý học viên)
    └── /instructor/comments (Quản lý bình luận)
```

## Chi tiết từng module

### 1. Trang chủ
- **Route**: `/[locale]/`
- **Mô tả**: Trang chủ hiển thị các section chính
- **Components**: 
  - HeroSection
  - StatSection
  - HotCourseSection
  - FreeCourseList
  - CategoryListSection
  - QuizSection
  - BlogSection
  - FeaturesSection
  - FaqSection
  - CtaSection

### 2. Giới thiệu
- **Route**: `/[locale]/about`
- **Mô tả**: Trang giới thiệu về Wishzy

### 3. Xác thực (Authentication)
- **Route base**: `/[locale]/auth/`
- **Sub-routes**:
  - `login` - Đăng nhập
  - `register` - Đăng ký
  - `forgot-password` - Quên mật khẩu
  - `reset-password` - Đặt lại mật khẩu
  - `verify-email` - Xác thực email

### 4. Khóa học
- **Route base**: `/[locale]/`
- **Sub-routes**:
  - `course-detail/[id]` - Chi tiết khóa học
  - `search` - Tìm kiếm khóa học (với filters)

### 5. Học tập (Learning)
- **Route base**: `/[locale]/learning/`
- **Sub-routes**:
  - `[courseId]` - Trang khóa học đang học (danh sách bài giảng)
  - `[courseId]/[lectureId]` - Chi tiết bài giảng (video player)

### 6. Bài kiểm tra (Quiz)
- **Route base**: `/[locale]/quiz/`
- **Sub-routes**:
  - `/` - Danh sách quiz
  - `[quizId]` - Chi tiết quiz (làm bài)
  - `[quizId]/result` - Kết quả quiz

### 7. Blog
- **Route base**: `/[locale]/blog/`
- **Sub-routes**:
  - `/` - Danh sách bài viết
  - `[blogId]` - Chi tiết bài viết

### 8. Giỏ hàng & Thanh toán
- **Route base**: `/[locale]/`
- **Sub-routes**:
  - `cart` - Giỏ hàng
  - `checkout` - Trang thanh toán
  - `checkout/success` - Thanh toán thành công
  - `payment/callback` - Callback từ payment gateway (VNPay)
  - `payment-result` - Kết quả thanh toán

### 9. Người dùng
- **Route base**: `/[locale]/`
- **Sub-routes**:
  - `profile` - Hồ sơ cá nhân
    - `?tab=profile` - Thông tin cá nhân
    - `?tab=my-learning` - Khóa học của tôi
    - `?tab=wishlist` - Khóa học yêu thích
  - `dashboard` - Bảng điều khiển
  - `certificates/[enrollmentId]` - Xem chứng chỉ

### 10. Giảng viên (Instructor)
- **Route base**: `/[locale]/instructor/`
- **Layout**: Có layout riêng với sidebar
- **Sub-routes**:
  - `/` - Tổng quan (Dashboard)
  - `revenue` - Quản lý doanh thu
  - `courses` - Danh sách khóa học
  - `courses/create` - Tạo khóa học mới
  - `courses/[id]` - Chi tiết khóa học
  - `courses/edit/[id]` - Chỉnh sửa khóa học
  - `courses/sales` - Quản lý sale/khuyến mãi
  - `course/[id]` - Chi tiết khóa học (route thay thế)
  - `user/students` - Quản lý học viên
  - `comments` - Quản lý bình luận

## Cấu trúc Navigation (Header)

Header chính được định nghĩa trong `Header.tsx` với các thành phần:

1. **Logo** - Link về trang chủ
2. **Discover Dropdown** - Menu khám phá
3. **Search Header** - Tìm kiếm khóa học
4. **Navigation Links** (Desktop):
   - Tính năng (scroll to #features)
   - FAQ (scroll to #faq)
5. **User Menu** (khi đã đăng nhập):
   - Khoá học yêu thích (`/profile?tab=wishlist`)
   - Khoá học của tôi (`/profile?tab=my-learning`)
   - Hồ sơ (`/profile?tab=profile`)
   - Theme switcher
   - Language switcher
   - Đăng xuất
6. **Auth Buttons** (khi chưa đăng nhập):
   - Đăng nhập (`/auth/login`)
   - Đăng ký (`/auth/register`)
7. **Cart Popover** - Giỏ hàng
8. **Mobile Menu** - Sheet menu cho mobile

## Cấu trúc Navigation (Instructor Sidebar)

Instructor sidebar được định nghĩa trong `InstructorAppSidebar.tsx`:

1. **Thống kê & báo cáo** (Không collapsible)
   - Tổng quan (`/instructor`)
   - Quản lý doanh thu (`/instructor/revenue`)

2. **Quản lý người dùng** (Collapsible)
   - Học viên (`/instructor/user/students`)

3. **Quản lý khóa học** (Collapsible)
   - Khóa học (`/instructor/courses`)
   - Quản lý sale (`/instructor/courses/sales`)

4. **Quản lý bình luận** (Collapsible)
   - Bình luận (`/instructor/comments`)

## Phân loại theo chức năng

### Public Pages (Không cần đăng nhập)
- ✅ **Home** - Trang chủ
- ✅ **About** - Giới thiệu
- ✅ **Auth** - Tất cả trang xác thực
- ✅ **Course Detail** - Chi tiết khóa học
- ✅ **Search** - Tìm kiếm
- ✅ **Blog** - Danh sách và chi tiết blog
- ✅ **Quiz List** - Danh sách quiz

### Protected Pages (Cần đăng nhập)
- 🔒 **Learning** - Học khóa học
- 🔒 **Quiz Detail/Result** - Làm quiz và xem kết quả
- 🔒 **Cart** - Giỏ hàng
- 🔒 **Checkout** - Thanh toán
- 🔒 **Profile** - Hồ sơ cá nhân
- 🔒 **Dashboard** - Bảng điều khiển
- 🔒 **Certificates** - Chứng chỉ

### Instructor Only Pages (Chỉ giảng viên)
- 👨‍🏫 **Instructor Dashboard** - Tất cả routes trong `/instructor/*`
- 👨‍🏫 **Course Management** - Quản lý khóa học
- 👨‍🏫 **Revenue** - Quản lý doanh thu
- 👨‍🏫 **Students** - Quản lý học viên
- 👨‍🏫 **Comments** - Quản lý bình luận

## Lưu ý

- Tất cả routes đều có prefix `/[locale]/` để hỗ trợ đa ngôn ngữ (vi/en)
- Layout chung được định nghĩa trong `/[locale]/layout.tsx`
- Instructor có layout riêng trong `/[locale]/instructor/layout.tsx`
- Header không hiển thị trên routes `/admin/*` và `/instructor/*`
- Profile page sử dụng query params để switch tabs: `?tab=profile|my-learning|wishlist`
- Payment callback routes xử lý kết quả từ payment gateway

## Thống kê

- **Tổng số routes chính**: 10 modules
- **Tổng số pages**: 40+ pages
- **Public routes**: ~15 routes
- **Protected routes**: ~10 routes
- **Instructor routes**: ~10 routes
- **Auth routes**: 5 routes

