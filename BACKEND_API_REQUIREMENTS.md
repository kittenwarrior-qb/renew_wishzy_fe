# Yêu Cầu API Backend - Quản Lý Doanh Thu (Revenue Management)

## Tổng Quan
Tài liệu này mô tả các API endpoints cần thiết để hỗ trợ tính năng **Quản lý doanh thu** cho Instructor trên Frontend.

---

## 1. API: Lấy Thống Kê Doanh Thu Tổng Quan

### Endpoint
```
GET /api/v1/courses/instructor/revenue/statistics
```

### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string (ISO 8601) | No | Ngày bắt đầu (VD: 2024-01-01) |
| `endDate` | string (ISO 8601) | No | Ngày kết thúc (VD: 2024-12-31) |

### Response Format
```json
{
  "success": true,
  "message": "Revenue statistics retrieved successfully",
  "data": {
    "totalRevenue": 125000000,
    "monthlyRevenue": 15000000,
    "totalStudents": 342,
    "totalCourses": 12,
    "averageRevenuePerCourse": 10416667,
    "growthRate": 15.5
  }
}
```

### Response Fields
- `totalRevenue` (number): Tổng doanh thu từ tất cả khóa học của instructor (tính từ OrderDetail có status = COMPLETED)
- `monthlyRevenue` (number): Doanh thu trong tháng hiện tại
- `totalStudents` (number): Tổng số học viên đã đăng ký (từ Enrollment)
- `totalCourses` (number): Tổng số khóa học do instructor tạo
- `averageRevenuePerCourse` (number): Doanh thu trung bình mỗi khóa học
- `growthRate` (number): Tỷ lệ tăng trưởng doanh thu so với tháng trước (%)

### Logic Backend
1. Lấy `instructorId` từ JWT token (CurrentUser)
2. Tìm tất cả `Course` có `createdBy = instructorId`
3. Tìm tất cả `OrderDetail` có `courseId` trong danh sách courses và `Order.status = 'completed'`
4. Tính tổng `OrderDetail.price` = `totalRevenue`
5. Tính `monthlyRevenue` từ các OrderDetail trong tháng hiện tại
6. Đếm số `Enrollment` có `courseId` trong danh sách courses = `totalStudents`
7. Đếm số `Course` = `totalCourses`
8. Tính `averageRevenuePerCourse` = `totalRevenue / totalCourses`
9. Tính `growthRate` = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

---

## 2. API: Lấy Danh Sách Khóa Học Bán Chạy Nhất

### Endpoint
```
GET /api/v1/courses/instructor/revenue/top-selling
```

### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Số lượng khóa học trả về (default: 5) |
| `startDate` | string (ISO 8601) | No | Ngày bắt đầu filter |
| `endDate` | string (ISO 8601) | No | Ngày kết thúc filter |

### Response Format
```json
{
  "success": true,
  "message": "Top selling courses retrieved successfully",
  "data": [
    {
      "courseId": "uuid",
      "courseName": "Lập trình JavaScript từ cơ bản đến nâng cao",
      "thumbnail": "https://example.com/image.jpg",
      "categoryName": "Lập trình",
      "price": 500000,
      "totalRevenue": 25000000,
      "totalSales": 50,
      "totalStudents": 50,
      "enrollmentCount": 50,
      "averageRating": 4.8,
      "createdAt": "2024-01-15T00:00:00Z",
      "rank": 1
    }
  ]
}
```

### Response Fields
- `courseId` (string): ID của khóa học
- `courseName` (string): Tên khóa học
- `thumbnail` (string, optional): URL hình ảnh thumbnail
- `categoryName` (string, optional): Tên danh mục
- `price` (number): Giá khóa học
- `totalRevenue` (number): Tổng doanh thu từ khóa học này
- `totalSales` (number): Số lượng OrderDetail (đơn hàng)
- `totalStudents` (number): Số lượng học viên (Enrollment)
- `enrollmentCount` (number): Số lượng enrollment (tương đương totalStudents)
- `averageRating` (number, optional): Đánh giá trung bình
- `createdAt` (string): Ngày tạo khóa học
- `rank` (number): Thứ hạng (1, 2, 3, ...)

### Logic Backend
1. Lấy `instructorId` từ JWT token
2. Tìm tất cả `Course` có `createdBy = instructorId`
3. Với mỗi course:
   - Tính tổng `OrderDetail.price` từ các Order có status = 'completed' = `totalRevenue`
   - Đếm số `OrderDetail` = `totalSales`
   - Đếm số `Enrollment` = `totalStudents`
4. Sắp xếp theo `totalRevenue` giảm dần
5. Lấy top `limit` khóa học
6. Thêm `rank` cho mỗi khóa học

---

## 3. API: Lấy Danh Sách Khóa Học Có Nhiều Học Viên Nhất

### Endpoint
```
GET /api/v1/courses/instructor/revenue/most-students
```

### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Số lượng khóa học trả về (default: 5) |
| `startDate` | string (ISO 8601) | No | Ngày bắt đầu filter |
| `endDate` | string (ISO 8601) | No | Ngày kết thúc filter |

### Response Format
```json
{
  "success": true,
  "message": "Courses with most students retrieved successfully",
  "data": [
    {
      "courseId": "uuid",
      "courseName": "Lập trình JavaScript từ cơ bản đến nâng cao",
      "thumbnail": "https://example.com/image.jpg",
      "categoryName": "Lập trình",
      "price": 500000,
      "totalRevenue": 25000000,
      "totalSales": 50,
      "totalStudents": 50,
      "enrollmentCount": 50,
      "averageRating": 4.8,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Response Fields
- Tương tự như API Top Selling, nhưng sắp xếp theo `totalStudents` giảm dần
- Không có field `rank`

### Logic Backend
1. Lấy `instructorId` từ JWT token
2. Tìm tất cả `Course` có `createdBy = instructorId`
3. Với mỗi course:
   - Đếm số `Enrollment` = `totalStudents`
   - Tính tổng `OrderDetail.price` = `totalRevenue`
   - Đếm số `OrderDetail` = `totalSales`
4. Sắp xếp theo `totalStudents` giảm dần
5. Lấy top `limit` khóa học

---

## 4. API: Lấy Doanh Thu Theo Thời Gian (Biểu Đồ)

### Endpoint
```
GET /api/v1/courses/instructor/revenue/by-period
```

### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | 'day', 'week', 'month', 'year' (default: 'month') |
| `startDate` | string (ISO 8601) | No | Ngày bắt đầu |
| `endDate` | string (ISO 8601) | No | Ngày kết thúc |
| `limit` | number | No | Số lượng period trả về (default: 12) |

### Response Format
```json
{
  "success": true,
  "message": "Revenue by period retrieved successfully",
  "data": [
    {
      "period": "2024-01",
      "revenue": 12000000,
      "sales": 45,
      "students": 45
    },
    {
      "period": "2024-02",
      "revenue": 15000000,
      "sales": 50,
      "students": 50
    }
  ]
}
```

### Response Fields
- `period` (string): Chu kỳ thời gian (format: "YYYY-MM" cho month, "YYYY-MM-DD" cho day, etc.)
- `revenue` (number): Doanh thu trong period này
- `sales` (number): Số lượng đơn hàng (OrderDetail)
- `students` (number): Số lượng học viên mới (Enrollment)

### Logic Backend
1. Lấy `instructorId` từ JWT token
2. Tìm tất cả `Course` có `createdBy = instructorId`
3. Tìm tất cả `OrderDetail` và `Enrollment` của các courses này
4. Group theo period (day/week/month/year) dựa trên `Order.createdAt` và `Enrollment.enrollmentDate`
5. Tính tổng `OrderDetail.price` = `revenue` cho mỗi period
6. Đếm số `OrderDetail` = `sales` cho mỗi period
7. Đếm số `Enrollment` = `students` cho mỗi period
8. Sắp xếp theo period tăng dần

---

## 5. API: Lấy Tất Cả Dữ Liệu Doanh Thu (All-in-One)

### Endpoint
```
GET /api/v1/courses/instructor/revenue
```

### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string (ISO 8601) | No | Ngày bắt đầu |
| `endDate` | string (ISO 8601) | No | Ngày kết thúc |
| `period` | string | No | 'day', 'week', 'month', 'year' (default: 'month') |
| `limit` | number | No | Số lượng top courses (default: 5) |

### Response Format
```json
{
  "success": true,
  "message": "Revenue data retrieved successfully",
  "data": {
    "statistics": {
      "totalRevenue": 125000000,
      "monthlyRevenue": 15000000,
      "totalStudents": 342,
      "totalCourses": 12,
      "averageRevenuePerCourse": 10416667,
      "growthRate": 15.5
    },
    "topSellingCourses": [...],
    "coursesWithMostStudents": [...],
    "revenueByPeriod": [...]
  }
}
```

### Response Fields
- Kết hợp tất cả dữ liệu từ các API trên

### Logic Backend
- Gọi logic của tất cả các API trên và trả về kết quả tổng hợp

---

## Lưu Ý Quan Trọng

### 1. Tính Doanh Thu
- **Chỉ tính các Order có `status = 'completed'`**
- Doanh thu = tổng `OrderDetail.price` (không phải `Order.totalPrice` vì có thể có voucher)
- Chỉ tính các OrderDetail có `courseId` thuộc về instructor

### 2. Tính Số Học Viên
- Số học viên = số lượng `Enrollment` unique (mỗi user chỉ đếm 1 lần cho mỗi course)
- Có thể có trường hợp: `totalSales` != `totalStudents` (nếu user mua nhiều lần hoặc có refund)

### 3. Performance
- Nên sử dụng database indexes cho:
  - `Order.status`
  - `OrderDetail.courseId`
  - `Enrollment.courseId`
  - `Course.createdBy`
- Có thể cache kết quả trong 5-15 phút tùy theo yêu cầu real-time

### 4. Security
- Luôn lấy `instructorId` từ JWT token, không cho phép truyền từ client
- Chỉ trả về dữ liệu của instructor đó, không cho phép xem dữ liệu của instructor khác

---

## Database Schema Reference

### Order Entity
```typescript
{
  id: string
  userId: string
  totalPrice: number
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod: string
  createdAt: Date
}
```

### OrderDetail Entity
```typescript
{
  id: string
  orderId: string
  courseId: string
  price: number
  createdAt: Date
}
```

### Enrollment Entity
```typescript
{
  id: string
  userId: string
  courseId: string
  detailOrderId: string
  enrollmentDate: Date
  status: string
  createdAt: Date
}
```

### Course Entity
```typescript
{
  id: string
  name: string
  price: number
  createdBy: string // instructorId
  thumbnail?: string
  categoryId: string
  averageRating?: number
  createdAt: Date
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Only instructors can access this endpoint"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message"
}
```

---

## Testing Checklist

- [ ] API trả về đúng dữ liệu cho instructor
- [ ] Không trả về dữ liệu của instructor khác
- [ ] Tính toán doanh thu chính xác (chỉ tính completed orders)
- [ ] Tính số học viên chính xác (unique enrollments)
- [ ] Filter theo date range hoạt động đúng
- [ ] Pagination/limit hoạt động đúng
- [ ] Performance tốt với lượng dữ liệu lớn
- [ ] Error handling đầy đủ

---

**Ngày tạo:** 2024
**Phiên bản:** 1.0
**Người yêu cầu:** Frontend Team

