# Yêu Cầu API Backend - Sale & Comments Management

## 📋 Tổng Quan
Tài liệu này mô tả các API endpoints cần thiết cho 2 tính năng:
1. Quản lý giá cả sale cho khóa học
2. Quản lý bình luận cho giảng viên

---

## 🎯 PHẦN 1: QUẢN LÝ SALE

### API 1: Cập Nhật Sale Cho Khóa Học

#### Endpoint
```
PATCH /api/v1/courses/:id/sale
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`
- Guard: `CourseOwnershipGuard` (chỉ owner mới được update)

#### Request Body
```json
{
  "saleInfo": {
    "saleType": "percent",  // "percent" | "fixed"
    "value": 20,            // Nếu percent: 0-50, Nếu fixed: số tiền < price
    "saleStartDate": "2024-12-01T00:00:00Z",  // Optional, ISO 8601
    "saleEndDate": "2024-12-31T23:59:59Z"     // Optional, ISO 8601
  }
}
```

**Hoặc để hủy sale:**
```json
{
  "saleInfo": null
}
```

#### Response
```json
{
  "success": true,
  "message": "Course sale updated successfully",
  "data": {
    "id": "uuid",
    "name": "Course Name",
    "price": 500000,
    "saleInfo": {
      "saleType": "percent",
      "value": 20,
      "saleStartDate": "2024-12-01T00:00:00Z",
      "saleEndDate": "2024-12-31T23:59:59Z"
    }
  }
}
```

#### Validation Rules
1. **saleType**: Phải là `"percent"` hoặc `"fixed"`
2. **value**:
   - Nếu `percent`: 0 <= value <= 50
   - Nếu `fixed`: 0 < value < price
3. **saleEndDate**: Phải > saleStartDate (nếu có)
4. **saleStartDate**: Có thể là quá khứ (để set sale đã bắt đầu)

#### Logic Backend
```typescript
// Pseudo code
async updateCourseSale(courseId: string, saleInfo: SaleInfo | null) {
  const course = await this.courseRepository.findOne({ where: { id: courseId } })
  
  if (!course) throw NotFoundException()
  
  // Validate ownership (CourseOwnershipGuard)
  
  if (saleInfo === null) {
    // Hủy sale
    course.saleInfo = null
  } else {
    // Validate saleInfo
    if (saleInfo.saleType === 'percent' && saleInfo.value > 50) {
      throw BadRequestException('Sale percentage cannot exceed 50%')
    }
    if (saleInfo.saleType === 'fixed' && saleInfo.value >= course.price) {
      throw BadRequestException('Fixed sale value must be less than course price')
    }
    if (saleInfo.saleEndDate && saleInfo.saleStartDate) {
      if (new Date(saleInfo.saleEndDate) <= new Date(saleInfo.saleStartDate)) {
        throw BadRequestException('End date must be after start date')
      }
    }
    
    course.saleInfo = saleInfo
  }
  
  return await this.courseRepository.save(course)
}
```

#### Error Responses
```json
// 400 Bad Request
{
  "success": false,
  "message": "Sale percentage cannot exceed 50%",
  "error": "Validation failed"
}

// 403 Forbidden
{
  "success": false,
  "message": "You can only update your own courses",
  "error": "Forbidden"
}

// 404 Not Found
{
  "success": false,
  "message": "Course not found",
  "error": "Not Found"
}
```

---

### API 2: Lấy Danh Sách Courses Có Sale (Optional)

#### Endpoint
```
GET /api/v1/courses/instructor/my-courses/sales
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `active` (đang sale), `upcoming` (sắp sale), `expired` (hết sale), `none` (không sale) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |

#### Response
```json
{
  "success": true,
  "message": "Courses with sales retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Course Name",
        "price": 500000,
        "saleInfo": {
          "saleType": "percent",
          "value": 20,
          "saleStartDate": "2024-12-01T00:00:00Z",
          "saleEndDate": "2024-12-31T23:59:59Z"
        },
        "salePrice": 400000,  // Giá sau sale
        "saleStatus": "active"  // "active" | "upcoming" | "expired" | "none"
      }
    ],
    "pagination": {
      "totalPage": 5,
      "totalItems": 50,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  }
}
```

---

## 💬 PHẦN 2: QUẢN LÝ COMMENTS

### API 1: Lấy Comments Của Instructor

#### Endpoint
```
GET /api/v1/comments/instructor/my-comments
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `courseId` | string | No | Filter theo course ID |
| `rating` | number | No | Filter theo rating (1-5) |
| `hasReply` | boolean | No | Filter đã/chưa phản hồi (true/false) |
| `sort` | string | No | `newest`, `oldest`, `rating_high`, `rating_low`, `likes` (default: newest) |

#### Response
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "content": "Great course!",
        "rating": 5,
        "like": 10,
        "dislike": 0,
        "userId": "uuid",
        "courseId": "uuid",
        "courseName": "Course Name",
        "parentId": null,
        "reply": null,  // Reply của instructor (nếu có)
        "createdAt": "2024-11-14T10:00:00.000Z",
        "updatedAt": "2024-11-14T10:00:00.000Z",
        "user": {
          "id": "uuid",
          "fullName": "Student Name",
          "avatar": "url"
        }
      }
    ],
    "pagination": {
      "totalPage": 10,
      "totalItems": 100,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  }
}
```

#### Logic Backend
```typescript
// Pseudo code
async getInstructorComments(instructorId: string, filters: FilterCommentDto) {
  // 1. Lấy tất cả courses của instructor
  const courses = await this.courseRepository.find({
    where: { createdBy: instructorId },
    select: ['id']
  })
  const courseIds = courses.map(c => c.id)
  
  // 2. Query comments
  const queryBuilder = this.commentRepository
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoin('comment.course', 'course')
    .addSelect(['course.id', 'course.name'])
    .where('comment.courseId IN (:...courseIds)', { courseIds })
  
  // 3. Apply filters
  if (filters.courseId) {
    queryBuilder.andWhere('comment.courseId = :courseId', { courseId: filters.courseId })
  }
  if (filters.rating) {
    queryBuilder.andWhere('comment.rating = :rating', { rating: filters.rating })
  }
  if (filters.hasReply !== undefined) {
    // Check nếu có reply (cần join với replies table hoặc check parentId)
    // Logic này phụ thuộc vào schema reply
  }
  
  // 4. Apply sort
  switch (filters.sort) {
    case 'oldest':
      queryBuilder.orderBy('comment.createdAt', 'ASC')
      break
    case 'rating_high':
      queryBuilder.orderBy('comment.rating', 'DESC')
      break
    case 'rating_low':
      queryBuilder.orderBy('comment.rating', 'ASC')
      break
    case 'likes':
      queryBuilder.orderBy('comment.like', 'DESC')
      break
    default:
      queryBuilder.orderBy('comment.createdAt', 'DESC')
  }
  
  // 5. Pagination
  queryBuilder.skip((filters.page - 1) * filters.limit)
  queryBuilder.take(filters.limit)
  
  const [comments, total] = await queryBuilder.getManyAndCount()
  
  return {
    items: comments,
    pagination: {
      totalPage: Math.ceil(total / filters.limit),
      totalItems: total,
      currentPage: filters.page,
      itemsPerPage: filters.limit
    }
  }
}
```

---

### API 2: Phản Hồi Comment (Reply)

#### Endpoint
```
POST /api/v1/comments/:commentId/reply
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

#### Request Body
```json
{
  "content": "Cảm ơn bạn đã đánh giá! Chúng tôi sẽ cải thiện..."
}
```

#### Response
```json
{
  "success": true,
  "message": "Comment replied successfully",
  "data": {
    "id": "uuid",
    "content": "Cảm ơn bạn đã đánh giá!",
    "parentId": "uuid",  // ID của comment gốc
    "userId": "uuid",    // ID của instructor
    "courseId": "uuid",
    "createdAt": "2024-11-14T11:00:00.000Z",
    "user": {
      "id": "uuid",
      "fullName": "Instructor Name",
      "avatar": "url"
    }
  }
}
```

#### Logic Backend
```typescript
// Pseudo code
async replyToComment(commentId: string, content: string, instructorId: string) {
  // 1. Tìm comment gốc
  const originalComment = await this.commentRepository.findOne({
    where: { id: commentId },
    relations: ['course']
  })
  
  if (!originalComment) {
    throw NotFoundException('Comment not found')
  }
  
  // 2. Verify instructor là owner của course
  if (originalComment.course.createdBy !== instructorId) {
    throw ForbiddenException('You can only reply to comments on your courses')
  }
  
  // 3. Tạo reply comment
  const reply = this.commentRepository.create({
    content,
    parentId: commentId,  // Link đến comment gốc
    userId: instructorId,
    courseId: originalComment.courseId,
    rating: 0  // Reply không có rating
  })
  
  return await this.commentRepository.save(reply)
}
```

**Lưu ý:** Cần bổ sung `parentId` vào Comment entity nếu chưa có.

---

### API 3: Thống Kê Comments Cho Instructor

#### Endpoint
```
GET /api/v1/comments/instructor/stats
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

#### Response
```json
{
  "success": true,
  "message": "Comment statistics retrieved successfully",
  "data": {
    "totalComments": 100,
    "unrepliedComments": 15,
    "averageRating": 4.5,
    "recentComments": 5,  // Comments trong 24h
    "ratingDistribution": {
      "5": 50,
      "4": 30,
      "3": 10,
      "2": 5,
      "1": 5
    }
  }
}
```

#### Logic Backend
```typescript
// Pseudo code
async getInstructorCommentStats(instructorId: string) {
  // 1. Lấy courses của instructor
  const courses = await this.courseRepository.find({
    where: { createdBy: instructorId },
    select: ['id']
  })
  const courseIds = courses.map(c => c.id)
  
  // 2. Tính tổng comments
  const totalComments = await this.commentRepository.count({
    where: { courseId: In(courseIds) }
  })
  
  // 3. Tính comments chưa phản hồi (chưa có reply)
  const unrepliedComments = await this.commentRepository
    .createQueryBuilder('comment')
    .where('comment.courseId IN (:...courseIds)', { courseIds })
    .andWhere('comment.parentId IS NULL')  // Comment gốc
    .andWhere('NOT EXISTS (SELECT 1 FROM comments c2 WHERE c2.parentId = comment.id)')  // Chưa có reply
    .getCount()
  
  // 4. Tính rating trung bình
  const avgRating = await this.commentRepository
    .createQueryBuilder('comment')
    .select('AVG(comment.rating)', 'avg')
    .where('comment.courseId IN (:...courseIds)', { courseIds })
    .getRawOne()
  
  // 5. Comments trong 24h
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const recentComments = await this.commentRepository.count({
    where: {
      courseId: In(courseIds),
      createdAt: MoreThan(yesterday)
    }
  })
  
  // 6. Phân bố rating
  const ratingDistribution = await this.commentRepository
    .createQueryBuilder('comment')
    .select('comment.rating', 'rating')
    .addSelect('COUNT(*)', 'count')
    .where('comment.courseId IN (:...courseIds)', { courseIds })
    .groupBy('comment.rating')
    .getRawMany()
  
  return {
    totalComments,
    unrepliedComments,
    averageRating: parseFloat(avgRating?.avg || '0'),
    recentComments,
    ratingDistribution: ratingDistribution.reduce((acc, item) => {
      acc[item.rating] = parseInt(item.count)
      return acc
    }, {})
  }
}
```

---

### API 4: Xóa Comment (Optional)

#### Endpoint
```
DELETE /api/v1/comments/:commentId
```

#### Authentication
- Required: `Bearer Token` (JWT)
- Role: `INSTRUCTOR` hoặc `ADMIN`

#### Logic
- Instructor chỉ có thể xóa comments trên courses của mình
- Hoặc chỉ có thể xóa reply của mình

#### Response
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 📊 Database Schema Updates

### Comment Entity (Cần bổ sung)
```typescript
@Column({ type: 'uuid', nullable: true, name: 'parent_id' })
parentId?: string;  // ID của comment gốc (nếu là reply)

@Column({ type: 'uuid', nullable: true, name: 'lesson_id' })
lessonId?: string;  // ID của bài học (nếu comment cho lesson cụ thể)
```

---

## 🔒 Security & Validation

### Sale Management
- ✅ Chỉ owner course mới được update sale
- ✅ Validate saleType, value
- ✅ Validate date range
- ✅ Max 50% discount

### Comment Management
- ✅ Chỉ instructor owner course mới được reply
- ✅ Validate content không rỗng
- ✅ Rate limiting (tránh spam reply)

---

## 🧪 Test Cases

### Sale Management
- [ ] Update sale thành công
- [ ] Hủy sale thành công
- [ ] Validate percent > 50% → Error
- [ ] Validate fixed > price → Error
- [ ] Validate endDate < startDate → Error
- [ ] Chỉ owner mới được update → 403

### Comment Management
- [ ] Lấy comments của instructor thành công
- [ ] Filter theo course → Đúng
- [ ] Filter theo rating → Đúng
- [ ] Reply comment thành công
- [ ] Chỉ owner course mới được reply → 403
- [ ] Stats tính đúng

---

**Ngày tạo:** 2024  
**Phiên bản:** 1.0  
**Người yêu cầu:** Frontend Team

