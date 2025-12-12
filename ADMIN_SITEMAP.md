# Sitemap Trang Admin - Wishzy

## Cấu trúc tổng quan

```
/[locale]/admin/
│
├── 📊 Dashboard (Tổng quan)
│   └── /[locale]/admin/
│
├── 👥 Quản lý người dùng
│   ├── /[locale]/admin/users/students
│   │   └── /[locale]/admin/users/students/[id] (Chi tiết học sinh)
│   ├── /[locale]/admin/users/teachers
│   └── /[locale]/admin/users/admins
│
├── 📚 Quản lý danh mục
│   └── /[locale]/admin/categories
│       └── /[locale]/admin/categories/trash (Redirect đến categories?deleted=true)
│
├── 🎓 Quản lý khóa học
│   ├── /[locale]/admin/courses
│   ├── /[locale]/admin/courses/create
│   ├── /[locale]/admin/courses/[id] (Chi tiết khóa học)
│   └── /[locale]/admin/courses/edit/[id]
│
├── 📝 Quản lý bài kiểm tra
│   ├── /[locale]/admin/exams
│   ├── /[locale]/admin/exams/create
│   ├── /[locale]/admin/exams/[id] (Chi tiết bài kiểm tra)
│   └── /[locale]/admin/exams/edit/[id]
│
├── 💬 Quản lý giao tiếp
│   ├── /[locale]/admin/communication/reviews (Đánh giá)
│   └── /[locale]/admin/communication/comments (Bình luận)
│
├── 📄 Quản lý bài viết
│   ├── /[locale]/admin/posts
│   ├── /[locale]/admin/posts/create
│   ├── /[locale]/admin/posts/categories (Danh mục bài viết)
│   └── /[locale]/admin/posts/comments (Bình luận bài viết)
│
├── 🛒 Quản lý đơn hàng
│   ├── /[locale]/admin/orders
│   └── /[locale]/admin/orders/[id] (Chi tiết đơn hàng)
│
├── 🖼️ Quản lý banner
│   └── /[locale]/admin/banners
│
├── 🎫 Quản lý voucher
│   ├── /[locale]/admin/vouchers
│   └── /[locale]/admin/vouchers/create
│
├── 📖 Môn học (Subjects)
│   └── /[locale]/admin/subjects
│
└── ⚙️ Cài đặt
    └── /[locale]/admin/settings
```

## Chi tiết từng module

### 1. Dashboard (Tổng quan)
- **Route**: `/[locale]/admin/`
- **Mô tả**: Trang tổng quan hiển thị thống kê tổng hợp
- **Components**: 
  - StatsCard (Học viên, Giáo viên, Khóa học, Doanh thu)
  - RevenueChart (Biểu đồ doanh thu)
  - TopStudents (Top học viên)
  - TopInstructors (Top giảng viên)
  - TopCourses (Top khóa học)

### 2. Quản lý người dùng
- **Route base**: `/[locale]/admin/users/`
- **Sub-routes**:
  - `students` - Danh sách học sinh
  - `students/[id]` - Chi tiết học sinh
  - `teachers` - Danh sách giảng viên
  - `admins` - Danh sách quản trị viên

### 3. Quản lý danh mục
- **Route base**: `/[locale]/admin/categories`
- **Sub-routes**:
  - `/` - Danh sách danh mục
  - `/trash` - Redirect đến danh sách với filter deleted=true

### 4. Quản lý khóa học
- **Route base**: `/[locale]/admin/courses`
- **Sub-routes**:
  - `/` - Danh sách khóa học
  - `/create` - Tạo khóa học mới
  - `/[id]` - Chi tiết khóa học
  - `/edit/[id]` - Chỉnh sửa khóa học

### 5. Quản lý bài kiểm tra
- **Route base**: `/[locale]/admin/exams`
- **Sub-routes**:
  - `/` - Danh sách bài kiểm tra
  - `/create` - Tạo bài kiểm tra mới
  - `/[id]` - Chi tiết bài kiểm tra
  - `/edit/[id]` - Chỉnh sửa bài kiểm tra

### 6. Quản lý giao tiếp
- **Route base**: `/[locale]/admin/communication`
- **Sub-routes**:
  - `/reviews` - Quản lý đánh giá
  - `/comments` - Quản lý bình luận

### 7. Quản lý bài viết
- **Route base**: `/[locale]/admin/posts`
- **Sub-routes**:
  - `/` - Danh sách bài viết
  - `/create` - Tạo bài viết mới
  - `/categories` - Danh mục bài viết
  - `/comments` - Bình luận bài viết

### 8. Quản lý đơn hàng
- **Route base**: `/[locale]/admin/orders`
- **Sub-routes**:
  - `/` - Danh sách đơn hàng
  - `/[id]` - Chi tiết đơn hàng

### 9. Quản lý banner
- **Route**: `/[locale]/admin/banners`
- **Mô tả**: Quản lý banner hiển thị trên website

### 10. Quản lý voucher
- **Route base**: `/[locale]/admin/vouchers`
- **Sub-routes**:
  - `/` - Danh sách voucher
  - `/create` - Tạo voucher mới

### 11. Môn học (Subjects)
- **Route**: `/[locale]/admin/subjects`
- **Lưu ý**: Trang này không xuất hiện trong sidebar menu chính

### 12. Cài đặt
- **Route**: `/[locale]/admin/settings`
- **Mô tả**: Trang cài đặt hệ thống

## Cấu trúc Navigation (Sidebar)

Sidebar được định nghĩa trong `AdminAppSidebar.tsx` với các nhóm menu:

1. **Dashboard** (Không collapsible)
   - Tổng quan

2. **Quản lý người dùng** (Collapsible)
   - Học sinh
   - Giảng viên
   - Quản trị viên

3. **Quản lý danh mục** (Collapsible)
   - Danh sách

4. **Quản lý khóa học** (Collapsible)
   - Khóa học

5. **Quản lý bài kiểm tra** (Collapsible)
   - Bài kiểm tra

6. **Quản lý giao tiếp** (Collapsible)
   - Đánh giá
   - Bình luận

7. **Quản lý bài viết** (Collapsible)
   - Danh sách bài viết
   - Danh mục bài viết
   - Bình luận

8. **Quản lý đơn hàng** (Collapsible)
   - Đơn hàng

9. **Quản lý banner** (Collapsible)
   - Banner

10. **Quản lý voucher** (Collapsible)
    - Voucher

11. **Cài đặt** (Không collapsible)
    - Thiết lập

## Lưu ý

- Tất cả routes đều có prefix `/[locale]/admin/` để hỗ trợ đa ngôn ngữ
- Layout chung được định nghĩa trong `/[locale]/admin/layout.tsx`
- Có guard bảo vệ routes (chỉ admin mới truy cập được)
- Có xử lý unsaved changes khi rời trang
- Sidebar có thể collapse/expand

