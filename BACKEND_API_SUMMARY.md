# Tóm Tắt API - Quản Lý Doanh Thu

## 🎯 Mục Đích
Cung cấp API để Instructor xem thống kê doanh thu và hiệu suất các khóa học của mình.

---

## 📌 Danh Sách API Cần Viết

### 1. **GET** `/api/v1/courses/instructor/revenue/statistics`
Thống kê tổng quan: tổng doanh thu, doanh thu tháng, số học viên, số khóa học, tỷ lệ tăng trưởng

### 2. **GET** `/api/v1/courses/instructor/revenue/top-selling`
Top khóa học bán chạy nhất (sắp xếp theo doanh thu)

### 3. **GET** `/api/v1/courses/instructor/revenue/most-students`
Top khóa học có nhiều học viên nhất

### 4. **GET** `/api/v1/courses/instructor/revenue/by-period`
Doanh thu theo thời gian (cho biểu đồ)

### 5. **GET** `/api/v1/courses/instructor/revenue` (Optional)
All-in-one: trả về tất cả dữ liệu trong 1 request

---

## 🔑 Yêu Cầu Bắt Buộc

1. **Authentication:** JWT Bearer Token - Role: INSTRUCTOR hoặc ADMIN
2. **Security:** Lấy `instructorId` từ JWT token, KHÔNG cho phép truyền từ client
3. **Doanh thu:** CHỈ tính Order có `status = 'completed'`
4. **Doanh thu =** tổng `OrderDetail.price` (không phải `Order.totalPrice`)
5. **Số học viên =** số lượng `Enrollment` unique

---

## 📊 Dữ Liệu Cần Tính

### Statistics
- `totalRevenue`: Tổng doanh thu từ tất cả OrderDetail (Order.status = 'completed')
- `monthlyRevenue`: Doanh thu tháng hiện tại
- `totalStudents`: Số lượng Enrollment unique
- `totalCourses`: Số lượng Course do instructor tạo
- `averageRevenuePerCourse`: totalRevenue / totalCourses
- `growthRate`: ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

### Top Selling Courses
- Sắp xếp theo `totalRevenue` giảm dần
- Mỗi course cần: courseId, courseName, thumbnail, categoryName, price, totalRevenue, totalSales, totalStudents, averageRating, rank

### Courses With Most Students
- Sắp xếp theo `totalStudents` giảm dần
- Tương tự Top Selling nhưng không có rank

### Revenue By Period
- Group theo day/week/month/year
- Mỗi period: period, revenue, sales, students

---

## 🗄️ Database Queries Cần Thiết

```sql
-- 1. Lấy tất cả courses của instructor
SELECT * FROM courses WHERE created_by = :instructorId

-- 2. Tính doanh thu từ OrderDetail
SELECT 
  od.course_id,
  SUM(od.price) as total_revenue,
  COUNT(od.id) as total_sales
FROM order_details od
INNER JOIN orders o ON od.order_id = o.id
WHERE od.course_id IN (:courseIds)
  AND o.status = 'completed'
GROUP BY od.course_id

-- 3. Đếm số học viên
SELECT 
  course_id,
  COUNT(DISTINCT user_id) as total_students
FROM enrollments
WHERE course_id IN (:courseIds)
GROUP BY course_id

-- 4. Doanh thu theo period
SELECT 
  DATE_TRUNC('month', o.created_at) as period,
  SUM(od.price) as revenue,
  COUNT(od.id) as sales,
  COUNT(DISTINCT e.user_id) as students
FROM order_details od
INNER JOIN orders o ON od.order_id = o.id
LEFT JOIN enrollments e ON e.detail_order_id = od.id
WHERE od.course_id IN (:courseIds)
  AND o.status = 'completed'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY period ASC
```

---

## 📝 Response Examples

### Statistics
```json
{
  "success": true,
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

### Top Selling
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid",
      "courseName": "JavaScript Course",
      "totalRevenue": 25000000,
      "totalSales": 50,
      "totalStudents": 50,
      "rank": 1
    }
  ]
}
```

---

## ⚠️ Lưu Ý

- **Performance:** Nên có indexes cho: Order.status, OrderDetail.courseId, Enrollment.courseId, Course.createdBy
- **Caching:** Có thể cache 5-15 phút
- **Filter:** Hỗ trợ filter theo startDate, endDate
- **Pagination:** Top courses có limit (default: 5)

---

**File chi tiết:** Xem `BACKEND_API_REQUIREMENTS.md` hoặc `BACKEND_API_SPECS.md`

