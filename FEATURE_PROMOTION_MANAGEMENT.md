## Phân Tích Nghiệp Vụ – Quản Lý Khuyến Mãi Khóa Học (Instructor)

### 1. Mục tiêu nghiệp vụ
- Giảng viên tự cấu hình chương trình khuyến mãi (sale) cho từng khoá học mà họ sở hữu.
- Giúp giảng viên theo dõi trạng thái khuyến mãi (đang áp dụng, sắp diễn ra, đã hết hạn) và hiệu quả của từng chương trình.
- Cho phép thao tác nhanh (bật/tắt sale, chỉnh sửa, huỷ) mà không cần backend can thiệp trực tiếp.

### 2. Đối tượng sử dụng
| Role | Quyền |
| --- | --- |
| `Instructor` | Toàn quyền tạo, cập nhật, huỷ sale cho những khoá học mình sở hữu. Xem dashboard, lọc & tìm kiếm sale. |
| `Admin` (tuỳ chọn) | Giám sát hoặc override khuyến mãi (không nằm trong scope hiện tại, nhưng cần chuẩn bị API roles). |

### 3. Phạm vi UI cần xây dựng trước (mock data)
1. **Trang danh sách sale** (`/instructor/courses/sales`)
   - Dashboard chỉ số (tổng số khoá có sale, đang sale, sắp sale, hết hạn, không sale).
   - Bộ lọc trạng thái sale, tìm kiếm theo tên khoá học.
   - Card/list hoặc table hiển thị thông tin: tên khoá, giá gốc, % giảm, giá sau sale, thời gian sale, trạng thái, action (Chỉnh sửa, Hủy, Xem khoá).
2. **Trang chỉnh sửa khoá học** (`/instructor/courses/edit/[id]`)
   - Section cấu hình sale riêng (SaleManagementSection) với các trường: bật/tắt sale, loại giảm (%, số tiền), giá trị, thời gian áp dụng, preview giá.
3. **Danh sách khoá học chung** (`/instructor/courses`)
   - Badge hiển thị nhanh trạng thái sale + % giảm.
4. **(Optional) Modal thao tác nhanh**
   - Cho phép bật/tắt sale ngay tại danh sách mà không cần rời trang.

### 4. Luồng nghiệp vụ chính
1. **Tạo/Cập nhật sale**
   - Instructor mở trang edit khoá học → bật sale → nhập loại giảm (percent/fixed), giá trị, thời gian → lưu.
   - Hệ thống validate theo luật (xem mục 5) → lưu vào saleInfo của course.
2. **Huỷ sale**
   - Instructor bấm “Huỷ sale” → Xác nhận → hệ thống xoá `saleInfo`.
3. **Theo dõi sale**
   - Instructor vào trang `/sales` để xem tổng quan tình trạng của tất cả khoá học.
   - Lọc theo trạng thái (đang/sắp/hết/không sale), tìm theo tên, sort.
4. **Tự động cập nhật trạng thái**
   - FE hoặc BE tính toán `saleStatus` dựa trên thời gian hiện tại (active/upcoming/expired/none).

### 5. Quy tắc nghiệp vụ & validation
| Trường | Quy tắc |
| --- | --- |
| `saleType` | `percent` hoặc `fixed`. |
| `value` (percent) | 0 < value ≤ 50 (cần confirm với backend). |
| `value` (fixed) | 0 < value < `price`. |
| `saleStartDate` | Không bắt buộc; nếu có phải ≤ `saleEndDate`. |
| `saleEndDate` | Không bắt buộc; nếu có phải > `saleStartDate` và ≥ hiện tại. |
| `saleStatus` | Được suy ra: `none` (không có saleInfo), `upcoming` (start > now), `active` (start ≤ now ≤ end), `expired` (end < now). |
| `salePrice` | = `price - discount`; luôn ≥ 0. |

### 6. Cấu trúc dữ liệu đề xuất
```ts
type SaleType = 'percent' | 'fixed'

interface SaleInfo {
  saleType: SaleType
  value: number
  saleStartDate?: string
  saleEndDate?: string
}

interface CourseSaleSnapshot {
  courseId: string
  courseName: string
  price: number
  saleInfo: SaleInfo | null
  salePrice?: number
  saleStatus: 'none' | 'upcoming' | 'active' | 'expired'
  metrics?: {
    studentCount?: number
    ordersDuringSale?: number
    revenueDuringSale?: number
  }
}
```

### 7. Thành phần frontend dự kiến
| Component | Mô tả |
| --- | --- |
| `SaleManagementSection` | Form chi tiết trong trang edit course (toggle, radio type, inputs, date pickers, preview). |
| `SaleBadge` | Hiển thị trạng thái sale + % giảm trong danh sách. |
| `SalePreview` | Card preview giá gốc/gốc, giá sau giảm, tiết kiệm. |
| `SalesDashboard` | Các card thống kê ở trang `/sales`. |
| `SalesFilterBar` | Search + filter theo trạng thái. |
| `SalesTable`/`SalesGrid` | Hiển thị từng khoá với thông tin sale. |

### 8. API backend cần cung cấp
#### 8.1. Lấy danh sách sale (dashboard)
```
GET /api/v1/instructor/courses/sales
Query:
  page?: number
  limit?: number
  status?: 'active' | 'upcoming' | 'expired' | 'none'
  search?: string

Response:
{
  items: CourseSaleSnapshot[]
  pagination: { page, limit, totalItems, totalPages }
  summary: {
    totalCourses: number
    activeCount: number
    upcomingCount: number
    expiredCount: number
    noSaleCount: number
  }
}
```

#### 8.2. Lấy sale của 1 khoá học
```
GET /api/v1/instructor/courses/:id/sale
Response: { courseId, price, saleInfo?, saleStatus, salePrice }
```

#### 8.3. Tạo/Cập nhật sale
```
PUT /api/v1/instructor/courses/:id/sale
Body: { saleInfo: SaleInfo | null }
```
> `saleInfo = null` dùng để huỷ sale. Backend cần validate quyền sở hữu khoá học.

#### 8.4. Bulk update (optional)
```
PATCH /api/v1/instructor/courses/sales
Body: {
  courseIds: string[]
  saleInfo: SaleInfo | null
}
```

#### 8.5. Thống kê hiệu quả sale (optional phase 2)
```
GET /api/v1/instructor/courses/sales/stats
Response:
{
  totalRevenueFromSale: number
  totalOrdersFromSale: number
  bestSaleCourse: CourseSaleSnapshot | null
  expiringSales: CourseSaleSnapshot[]
}
```

### 9. Phụ thuộc backend & checklist
- [ ] Endpoint riêng cho sale (`/courses/:id/sale`) để không ảnh hưởng payload update course chung.
- [ ] Validation saleInfo trong DTO (class-validator).
- [ ] Middleware/guard xác minh instructor sở hữu course.
- [ ] Response thống nhất (bọc trong `{ success, data }` hoặc giống các API hiện tại).
- [ ] Document rõ enum `SaleStatus`, `SaleType`.

### 10. Kế hoạch triển khai FE (mock → real)
1. **Phase 1 – Mock UI**
   - Tạo mock data `mockCourseSales`.
   - Render dashboard + list + form dựa trên mock.
2. **Phase 2 – Kết nối API**
   - Thay mock bằng `saleService`.
   - Thêm loading, error, optimistic update.
3. **Phase 3 – Nâng cao**
   - Bulk actions, thống kê nâng cao, thông báo sale sắp hết hạn.

---

*Người soạn: FE Team*  
*Ngày: 2024-11-28*










