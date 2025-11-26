# Phân Tích Chuyên Sâu - 2 Tính Năng Mới

## 📋 Tổng Quan

Tài liệu này phân tích chi tiết 2 tính năng cần phát triển:
1. **Quản lý giá cả sale cho khóa học** (Giảng viên)
2. **Quản lý bình luận đối với các bài học** (Giảng viên)

---

## 🎯 TÍNH NĂNG 1: QUẢN LÝ GIÁ CẢ SALE CHO KHÓA HỌC

### 1.1. Phân Tích Backend Hiện Tại

#### Database Schema
```typescript
// Course Entity
{
  id: string
  name: string
  price: number  // Giá gốc
  saleInfo?: {
    saleType: 'percent' | 'fixed',  // Loại giảm giá
    value: number,                  // Giá trị giảm (%, hoặc số tiền)
    saleStartDate?: Date,           // Ngày bắt đầu sale
    saleEndDate?: Date              // Ngày kết thúc sale
  }
  // ... các field khác
}
```

#### Business Rules (Từ Backend)
- ✅ **Sale percentage không được vượt quá 50%** (validate trong entity)
- ✅ **SaleType**: `percent` (giảm %) hoặc `fixed` (giảm số tiền cố định)
- ✅ **Có thể set thời gian sale** (startDate, endDate)
- ✅ **Update qua API**: `PUT /courses/:id` (UpdateCourseDto extends CreateCourseDto)

#### API Hiện Có
- ✅ `PUT /api/v1/courses/:id` - Update course (có thể update saleInfo)
- ✅ `GET /api/v1/courses/:id` - Lấy course detail (có saleInfo)
- ✅ `GET /api/v1/courses/instructor/my-courses` - Lấy danh sách courses của instructor

#### Vấn Đề Hiện Tại
- ❌ **CreateCourseDto không có field `saleInfo`** → Không thể set sale khi tạo course
- ❌ **UpdateCourseDto extends CreateCourseDto** → Có thể update saleInfo nhưng chưa có validation rõ ràng
- ❌ **Chưa có API riêng để quản lý sale** (chỉ update toàn bộ course)

---

### 1.2. Yêu Cầu Tính Năng

#### A. Quản Lý Sale Trong Trang Edit Course
**Vị trí:** `/instructor/courses/edit/[id]`

**Tính năng:**
1. **Hiển thị giá hiện tại:**
   - Giá gốc (price)
   - Giá sale (nếu có)
   - % giảm giá (nếu có)
   - Thời gian sale (nếu có)

2. **Form quản lý sale:**
   - Toggle bật/tắt sale
   - Chọn loại sale: `percent` hoặc `fixed`
   - Nhập giá trị sale:
     - Nếu `percent`: 0-50%
     - Nếu `fixed`: số tiền (phải < price)
   - Chọn thời gian:
     - Start date (optional)
     - End date (optional)
   - Preview giá sau sale

3. **Validation:**
   - Percent sale: 0-50%
   - Fixed sale: < price
   - End date > Start date (nếu có)
   - End date > Today (nếu có)

4. **Actions:**
   - Lưu sale
   - Hủy sale (xóa saleInfo)
   - Preview giá

#### B. Quản Lý Sale Trong Danh Sách Courses
**Vị trí:** `/instructor/courses`

**Tính năng:**
1. **Hiển thị badge sale:**
   - Badge "Đang sale" nếu có sale đang active
   - Badge "Sắp sale" nếu sale chưa bắt đầu
   - Badge "Hết sale" nếu sale đã kết thúc
   - Hiển thị % giảm giá

2. **Quick actions:**
   - Button "Quản lý sale" → Mở modal/dialog
   - Button "Hủy sale" (nếu đang sale)

3. **Filter/Sort:**
   - Filter theo: Đang sale / Sắp sale / Hết sale / Không sale
   - Sort theo: % giảm giá cao nhất

#### C. Trang Quản Lý Sale Riêng (Optional)
**Vị trí:** `/instructor/courses/sales` hoặc `/instructor/sales`

**Tính năng:**
1. **Dashboard sale:**
   - Tổng số courses đang sale
   - Tổng số courses sắp sale
   - Tổng số courses hết sale
   - Doanh thu từ sale (nếu có API)

2. **Danh sách courses với sale:**
   - Table hiển thị: Course name, Giá gốc, Giá sale, % giảm, Thời gian, Status
   - Actions: Edit sale, Hủy sale, Xem chi tiết

3. **Bulk actions:**
   - Hủy sale nhiều courses cùng lúc
   - Set sale cho nhiều courses (nếu cần)

---

### 1.3. UI/UX Design

#### Component Structure
```
/instructor/courses/
  ├── edit/[id]/
  │   └── page.tsx (thêm SaleManagementSection)
  ├── page.tsx (thêm SaleBadge, QuickActions)
  └── components/
      ├── SaleManagementSection.tsx (Form quản lý sale)
      ├── SaleBadge.tsx (Badge hiển thị sale)
      ├── SalePreview.tsx (Preview giá sau sale)
      └── SaleModal.tsx (Modal quản lý sale nhanh)
```

#### UI Components Cần Tạo

1. **SaleManagementSection.tsx**
   - Switch: Bật/tắt sale
   - RadioGroup: Chọn loại sale (percent/fixed)
   - Input: Giá trị sale
   - DatePicker: Start date, End date
   - Preview: Giá sau sale
   - Button: Lưu / Hủy

2. **SaleBadge.tsx**
   - Badge với màu sắc khác nhau theo status
   - Hiển thị % giảm giá

3. **SalePreview.tsx**
   - Card hiển thị: Giá gốc, Giá sale, % giảm, Tiết kiệm

---

### 1.4. API Requirements (Cần Backend)

#### Option 1: Sử dụng API hiện có
- ✅ `PUT /api/v1/courses/:id` - Update saleInfo trong course
- ❌ Cần thêm validation cho saleInfo trong UpdateCourseDto

#### Option 2: API riêng (Khuyến nghị)
```
PATCH /api/v1/courses/:id/sale
Body: {
  saleInfo?: {
    saleType: 'percent' | 'fixed',
    value: number,
    saleStartDate?: string,
    saleEndDate?: string
  } | null  // null để hủy sale
}
```

**Lợi ích:**
- Tách biệt logic sale
- Dễ validate
- Có thể thêm tính năng: lịch sử sale, analytics

---

### 1.5. Logic Tính Giá Sale

```typescript
function calculateSalePrice(price: number, saleInfo: SaleInfo): number {
  if (!saleInfo) return price
  
  const now = new Date()
  const startDate = saleInfo.saleStartDate ? new Date(saleInfo.saleStartDate) : null
  const endDate = saleInfo.saleEndDate ? new Date(saleInfo.saleEndDate) : null
  
  // Kiểm tra thời gian sale
  if (startDate && now < startDate) return price  // Chưa bắt đầu
  if (endDate && now > endDate) return price      // Đã kết thúc
  
  // Tính giá sale
  if (saleInfo.saleType === 'percent') {
    const discount = price * (saleInfo.value / 100)
    return Math.max(0, price - discount)
  } else if (saleInfo.saleType === 'fixed') {
    return Math.max(0, price - saleInfo.value)
  }
  
  return price
}
```

---

## 💬 TÍNH NĂNG 2: QUẢN LÝ BÌNH LUẬN ĐỐI VỚI CÁC BÀI HỌC

### 2.1. Phân Tích Backend Hiện Tại

#### Database Schema
```typescript
// Comment Entity
{
  id: string
  content: string
  rating: number        // 1-5 sao
  like: number
  dislike: number
  userId: string        // Người comment
  courseId: string     // Khóa học
  createdAt: Date
  updatedAt: Date
  user?: User           // Thông tin người comment
  course?: Course       // Thông tin khóa học
}
```

#### Business Rules
- ✅ **Chỉ học viên đã đăng ký mới được comment** (check enrollment)
- ✅ **User chỉ có thể edit comment của mình**
- ✅ **Có like/dislike** (tăng số đếm)
- ✅ **Comment gắn với courseId** (không có lessonId trong schema hiện tại)

#### API Hiện Có
- ✅ `GET /api/v1/comments?courseId=xxx` - Lấy comments theo course
- ✅ `GET /api/v1/comments/course/:courseId` - Lấy comments của course (có pagination)
- ✅ `POST /api/v1/comments` - Tạo comment (cần enrollment)
- ✅ `PUT /api/v1/comments/:commentId` - Update comment (chỉ owner)
- ✅ `PATCH /api/v1/comments/:commentId/like` - Like comment
- ✅ `PATCH /api/v1/comments/:commentId/dislike` - Dislike comment

#### Vấn Đề Hiện Tại
- ❌ **Chưa có API lấy comments của instructor** (tất cả courses của instructor)
- ❌ **Chưa có API filter comments theo instructor**
- ❌ **Chưa có API reply comment** (parentId không có trong schema)
- ❌ **Chưa có API delete comment** (chỉ có update)
- ❌ **Chưa có API phản hồi comment** (instructor reply)

---

### 2.2. Yêu Cầu Tính Năng

#### A. Trang Quản Lý Bình Luận Tổng Quan
**Vị trí:** `/instructor/comments` hoặc `/instructor/courses/comments`

**Tính năng:**
1. **Dashboard:**
   - Tổng số bình luận
   - Bình luận chưa phản hồi
   - Rating trung bình
   - Bình luận mới nhất (24h)

2. **Danh sách bình luận:**
   - Table/List hiển thị:
     - Avatar + Tên học viên
     - Tên khóa học (link)
     - Nội dung comment
     - Rating (sao)
     - Like/Dislike
     - Thời gian
     - Status: Đã phản hồi / Chưa phản hồi
   - Filter:
     - Theo khóa học
     - Theo rating (1-5 sao)
     - Theo status (đã/chưa phản hồi)
     - Theo thời gian (mới nhất, cũ nhất)
   - Sort:
     - Mới nhất
     - Rating cao nhất/thấp nhất
     - Nhiều like nhất

3. **Actions:**
   - Phản hồi comment (reply)
   - Xem chi tiết khóa học
   - Xem profile học viên
   - Like/Dislike (nếu cần)

#### B. Quản Lý Bình Luận Trong Trang Course Detail
**Vị trí:** `/instructor/courses/[id]`

**Tính năng:**
1. **Tab/Comments Section:**
   - Hiển thị tất cả comments của course này
   - Filter theo rating
   - Search comment
   - Phản hồi từng comment

2. **Comment Item:**
   - Hiển thị: Avatar, Tên, Rating, Content, Time
   - Button "Phản hồi" → Mở form reply
   - Button "Xem thêm" → Expand nếu comment dài

#### C. Modal/Dialog Phản Hồi Comment
**Tính năng:**
1. **Form phản hồi:**
   - Textarea: Nội dung phản hồi
   - Preview: Comment gốc
   - Button: Gửi / Hủy

2. **Hiển thị sau khi phản hồi:**
   - Badge "Đã phản hồi"
   - Hiển thị nội dung phản hồi
   - Thời gian phản hồi

---

### 2.3. UI/UX Design

#### Component Structure
```
/instructor/
  ├── comments/
  │   ├── page.tsx (Trang quản lý comments)
  │   └── components/
  │       ├── CommentList.tsx
  │       ├── CommentItem.tsx
  │       ├── CommentFilter.tsx
  │       ├── CommentReplyModal.tsx
  │       └── CommentStats.tsx
  └── courses/
      └── [id]/
          └── components/
              └── CourseComments.tsx
```

#### UI Components Cần Tạo

1. **CommentList.tsx**
   - List/Table comments
   - Pagination
   - Loading state
   - Empty state

2. **CommentItem.tsx**
   - Avatar + Tên học viên
   - Rating stars
   - Content
   - Like/Dislike count
   - Reply button
   - Time ago

3. **CommentReplyModal.tsx**
   - Modal với form reply
   - Preview comment gốc
   - Textarea + Submit button

4. **CommentFilter.tsx**
   - Filter dropdowns
   - Search input
   - Sort options

5. **CommentStats.tsx**
   - Cards hiển thị statistics

---

### 2.4. API Requirements (Cần Backend)

#### API Cần Thiết

1. **GET `/api/v1/comments/instructor/my-comments`**
   - Lấy tất cả comments của các courses do instructor tạo
   - Query params:
     - `page`, `limit`
     - `courseId?` (filter theo course)
     - `rating?` (filter theo rating)
     - `hasReply?` (filter đã/chưa phản hồi)
     - `sort?` (newest, oldest, rating, likes)

2. **POST `/api/v1/comments/:commentId/reply`** (Hoặc dùng parentId)
   - Instructor phản hồi comment
   - Body: `{ content: string }`
   - Response: Comment reply

3. **GET `/api/v1/comments/instructor/stats`**
   - Thống kê comments cho instructor
   - Response:
     ```json
     {
       "totalComments": 100,
       "unrepliedComments": 15,
       "averageRating": 4.5,
       "recentComments": 5
     }
     ```

4. **DELETE `/api/v1/comments/:commentId`** (Optional)
   - Xóa comment (nếu cần)

#### Schema Cần Bổ Sung (Nếu chưa có)

Nếu muốn có reply comment, cần thêm vào Comment entity:
```typescript
@Column({ type: 'uuid', nullable: true, name: 'parent_id' })
parentId?: string;  // ID của comment gốc (nếu là reply)

@Column({ type: 'uuid', nullable: true, name: 'lesson_id' })
lessonId?: string;  // ID của bài học (nếu comment cho lesson)
```

---

### 2.5. Workflow Quản Lý Comments

#### Flow 1: Xem Tất Cả Comments
```
1. Instructor vào /instructor/comments
2. Load comments từ API /comments/instructor/my-comments
3. Hiển thị danh sách với filter/sort
4. Click vào comment → Xem chi tiết hoặc phản hồi
```

#### Flow 2: Phản Hồi Comment
```
1. Click "Phản hồi" trên comment
2. Mở modal với form
3. Nhập nội dung phản hồi
4. Submit → Gọi API POST /comments/:commentId/reply
5. Update UI: Hiển thị reply, badge "Đã phản hồi"
```

#### Flow 3: Filter Comments
```
1. Chọn filter (course, rating, status)
2. Gọi API với query params
3. Update danh sách comments
```

---

## 📊 So Sánh & Đánh Giá

### Tính Năng 1: Quản Lý Sale
| Khía cạnh | Độ khó | Thời gian | Ưu tiên |
|-----------|--------|-----------|---------|
| Backend | Trung bình | 2-3 ngày | Cao |
| Frontend | Dễ | 3-4 ngày | Cao |
| Testing | Dễ | 1 ngày | Trung bình |
| **Tổng** | **Trung bình** | **6-8 ngày** | **Cao** |

### Tính Năng 2: Quản Lý Comments
| Khía cạnh | Độ khó | Thời gian | Ưu tiên |
|-----------|--------|-----------|---------|
| Backend | Khó | 4-5 ngày | Trung bình |
| Frontend | Trung bình | 4-5 ngày | Trung bình |
| Testing | Trung bình | 2 ngày | Trung bình |
| **Tổng** | **Khó** | **10-12 ngày** | **Trung bình** |

---

## 🎯 Kế Hoạch Phát Triển

### Phase 1: Quản Lý Sale (Ưu tiên cao)
**Tuần 1:**
- Day 1-2: Backend - API quản lý sale
- Day 3-4: Frontend - UI components
- Day 5: Integration & Testing

**Deliverables:**
- ✅ API `PATCH /courses/:id/sale`
- ✅ SaleManagementSection component
- ✅ SaleBadge component
- ✅ Integration vào edit course page

### Phase 2: Quản Lý Comments (Ưu tiên trung bình)
**Tuần 2-3:**
- Day 1-3: Backend - API comments cho instructor
- Day 4-6: Frontend - UI components
- Day 7-8: Integration & Testing

**Deliverables:**
- ✅ API `/comments/instructor/my-comments`
- ✅ API `/comments/:commentId/reply`
- ✅ CommentList, CommentItem components
- ✅ CommentReplyModal component
- ✅ Trang `/instructor/comments`

---

## 🔧 Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Form:** React Hook Form
- **Date Picker:** react-day-picker hoặc date-fns
- **Icons:** lucide-react

### Backend (Cần bổ sung)
- **Validation:** class-validator
- **Swagger:** @nestjs/swagger
- **Guards:** CourseOwnershipGuard (đã có)

---

## 📝 Checklist Phát Triển

### Tính Năng 1: Sale Management
- [ ] Backend: API PATCH /courses/:id/sale
- [ ] Backend: Validation saleInfo
- [ ] Frontend: SaleManagementSection component
- [ ] Frontend: SaleBadge component
- [ ] Frontend: SalePreview component
- [ ] Frontend: Integration vào edit course
- [ ] Frontend: Integration vào courses list
- [ ] Testing: Unit tests
- [ ] Testing: Integration tests

### Tính Năng 2: Comment Management
- [ ] Backend: API GET /comments/instructor/my-comments
- [ ] Backend: API POST /comments/:commentId/reply
- [ ] Backend: API GET /comments/instructor/stats
- [ ] Backend: Schema bổ sung (parentId, lessonId nếu cần)
- [ ] Frontend: CommentList component
- [ ] Frontend: CommentItem component
- [ ] Frontend: CommentReplyModal component
- [ ] Frontend: CommentFilter component
- [ ] Frontend: Trang /instructor/comments
- [ ] Frontend: Integration vào course detail
- [ ] Testing: Unit tests
- [ ] Testing: Integration tests

---

## 🚀 Next Steps

1. **Review & Approval:** Xem xét phân tích này với team
2. **Backend Planning:** Lên kế hoạch API cho backend team
3. **UI/UX Design:** Thiết kế mockup cho các components
4. **Development:** Bắt đầu phát triển theo phase
5. **Testing:** Test từng tính năng
6. **Deployment:** Deploy từng phase

---

**Ngày tạo:** 2024  
**Phiên bản:** 1.0  
**Người phân tích:** Frontend Team

