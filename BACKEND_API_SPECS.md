# API Specifications - Quản Lý Doanh Thu (Revenue Management)

## Tổng Quan
Tài liệu này mô tả các API endpoints cần thiết cho tính năng **Quản lý doanh thu** của Instructor.

---

## 📋 Danh Sách API Endpoints

### 1. GET `/api/v1/courses/instructor/revenue/statistics`
**Mô tả:** Lấy thống kê doanh thu tổng quan

**Authentication:** Bearer Token (JWT) - Role: INSTRUCTOR hoặc ADMIN

**Query Parameters:**
```typescript
{
  startDate?: string;  // ISO 8601: "2024-01-01"
  endDate?: string;    // ISO 8601: "2024-12-31"
}
```

**Response:**
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

**Logic:**
- Lấy `instructorId` từ JWT token
- Tìm tất cả `Course` có `createdBy = instructorId`
- Tính tổng `OrderDetail.price` từ các `Order` có `status = 'completed'`
- Tính `monthlyRevenue` = doanh thu tháng hiện tại
- Đếm `Enrollment` = `totalStudents`
- Đếm `Course` = `totalCourses`
- `averageRevenuePerCourse` = `totalRevenue / totalCourses`
- `growthRate` = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

---

### 2. GET `/api/v1/courses/instructor/revenue/top-selling`
**Mô tả:** Lấy danh sách khóa học bán chạy nhất (sắp xếp theo doanh thu)

**Authentication:** Bearer Token (JWT) - Role: INSTRUCTOR hoặc ADMIN

**Query Parameters:**
```typescript
{
  limit?: number;      // Default: 5
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
}
```

**Response:**
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

**Logic:**
- Lấy `instructorId` từ JWT token
- Tìm tất cả `Course` có `createdBy = instructorId`
- Với mỗi course:
  - Tính tổng `OrderDetail.price` (từ Order có status = 'completed') = `totalRevenue`
  - Đếm số `OrderDetail` = `totalSales`
  - Đếm số `Enrollment` = `totalStudents`
- Sắp xếp theo `totalRevenue` giảm dần
- Lấy top `limit` khóa học
- Thêm `rank` (1, 2, 3, ...)

---

### 3. GET `/api/v1/courses/instructor/revenue/most-students`
**Mô tả:** Lấy danh sách khóa học có nhiều học viên nhất

**Authentication:** Bearer Token (JWT) - Role: INSTRUCTOR hoặc ADMIN

**Query Parameters:**
```typescript
{
  limit?: number;      // Default: 5
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
}
```

**Response:**
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

**Logic:**
- Tương tự API Top Selling
- Nhưng sắp xếp theo `totalStudents` giảm dần
- Không có field `rank`

---

### 4. GET `/api/v1/courses/instructor/revenue/by-period`
**Mô tả:** Lấy doanh thu theo thời gian (cho biểu đồ)

**Authentication:** Bearer Token (JWT) - Role: INSTRUCTOR hoặc ADMIN

**Query Parameters:**
```typescript
{
  period?: 'day' | 'week' | 'month' | 'year';  // Default: 'month'
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
  limit?: number;      // Default: 12
}
```

**Response:**
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

**Logic:**
- Lấy `instructorId` từ JWT token
- Tìm tất cả `Course` có `createdBy = instructorId`
- Tìm tất cả `OrderDetail` và `Enrollment` của các courses này
- Group theo period (day/week/month/year) dựa trên `Order.createdAt` và `Enrollment.enrollmentDate`
- Tính tổng `OrderDetail.price` = `revenue` cho mỗi period
- Đếm số `OrderDetail` = `sales` cho mỗi period
- Đếm số `Enrollment` = `students` cho mỗi period
- Sắp xếp theo period tăng dần

**Format period:**
- `day`: "YYYY-MM-DD"
- `week`: "YYYY-WW" (VD: "2024-01")
- `month`: "YYYY-MM"
- `year`: "YYYY"

---

### 5. GET `/api/v1/courses/instructor/revenue` (All-in-One)
**Mô tả:** Lấy tất cả dữ liệu doanh thu trong một request

**Authentication:** Bearer Token (JWT) - Role: INSTRUCTOR hoặc ADMIN

**Query Parameters:**
```typescript
{
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
  period?: 'day' | 'week' | 'month' | 'year';  // Default: 'month'
  limit?: number;      // Default: 5
}
```

**Response:**
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

**Logic:**
- Kết hợp tất cả logic từ các API trên
- Trả về tất cả dữ liệu trong một response

---

## 🔑 Lưu Ý Quan Trọng

### 1. Tính Doanh Thu
- **CHỈ tính các Order có `status = 'completed'`**
- Doanh thu = tổng `OrderDetail.price` (không phải `Order.totalPrice`)
- Chỉ tính các OrderDetail có `courseId` thuộc về instructor

### 2. Tính Số Học Viên
- Số học viên = số lượng `Enrollment` unique (mỗi user chỉ đếm 1 lần cho mỗi course)
- `totalSales` có thể khác `totalStudents` (nếu user mua nhiều lần hoặc có refund)

### 3. Security
- **Luôn lấy `instructorId` từ JWT token**, không cho phép truyền từ client
- Chỉ trả về dữ liệu của instructor đó, không cho phép xem dữ liệu của instructor khác

### 4. Performance
- Nên sử dụng database indexes cho:
  - `Order.status`
  - `OrderDetail.courseId`
  - `Enrollment.courseId`
  - `Course.createdBy`
- Có thể cache kết quả trong 5-15 phút tùy theo yêu cầu real-time

---

## 📊 Database Schema Reference

### Order
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

### OrderDetail
```typescript
{
  id: string
  orderId: string
  courseId: string
  price: number  // Giá tại thời điểm mua
  createdAt: Date
}
```

### Enrollment
```typescript
{
  id: string
  userId: string
  courseId: string
  detailOrderId: string  // Link đến OrderDetail
  enrollmentDate: Date
  status: string
  createdAt: Date
}
```

### Course
```typescript
{
  id: string
  name: string
  price: number
  createdBy: string  // instructorId
  thumbnail?: string
  categoryId: string
  averageRating?: number
  createdAt: Date
}
```

---

## 🧪 Test Cases

### Test Case 1: Lấy thống kê cơ bản
- **Request:** `GET /api/v1/courses/instructor/revenue/statistics`
- **Expected:** Trả về đúng tổng doanh thu, số học viên, số khóa học

### Test Case 2: Filter theo date range
- **Request:** `GET /api/v1/courses/instructor/revenue/statistics?startDate=2024-01-01&endDate=2024-12-31`
- **Expected:** Chỉ tính doanh thu trong khoảng thời gian này

### Test Case 3: Top selling courses
- **Request:** `GET /api/v1/courses/instructor/revenue/top-selling?limit=5`
- **Expected:** Trả về 5 khóa học có doanh thu cao nhất, sắp xếp đúng

### Test Case 4: Security - Không được xem dữ liệu instructor khác
- **Request:** Instructor A gọi API
- **Expected:** Chỉ trả về dữ liệu của Instructor A

### Test Case 5: Chỉ tính completed orders
- **Request:** Có Order pending, completed, cancelled
- **Expected:** Chỉ tính Order có status = 'completed'

---

## 📝 Response Types (TypeScript)

```typescript
// Statistics Response
interface RevenueStatistics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalStudents: number;
  totalCourses: number;
  averageRevenuePerCourse: number;
  growthRate: number;
}

// Course Revenue
interface CourseRevenue {
  courseId: string;
  courseName: string;
  thumbnail?: string;
  categoryName?: string;
  price: number;
  totalRevenue: number;
  totalSales: number;
  totalStudents: number;
  enrollmentCount: number;
  averageRating?: number;
  createdAt: string;
  rank?: number;  // Chỉ có trong top-selling
}

// Revenue By Period
interface RevenueByPeriod {
  period: string;  // "2024-01", "2024-02", etc.
  revenue: number;
  sales: number;
  students: number;
}

// All-in-One Response
interface RevenueResponse {
  statistics: RevenueStatistics;
  topSellingCourses: CourseRevenue[];
  coursesWithMostStudents: CourseRevenue[];
  revenueByPeriod: RevenueByPeriod[];
}
```

---

## ❌ Error Responses

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

**Ngày tạo:** 2024  
**Phiên bản:** 1.0  
**Người yêu cầu:** Frontend Team

