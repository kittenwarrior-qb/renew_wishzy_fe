# Sitemap Diagram - Trang Client Wishzy

> 💡 **Lưu ý**: File này chứa các Mermaid diagrams có thể tự động render trong:
> - VS Code (với extension Mermaid Preview)
> - GitHub/GitLab (tự động render)
> - Các markdown viewer hỗ trợ Mermaid
> - Online tại [mermaid.live](https://mermaid.live)

## Sơ đồ cây phân cấp

```
/[locale]/
│
├─ 🏠 Trang chủ
│  └─ / (Homepage)
│
├─ 📄 Giới thiệu
│  └─ /about
│
├─ 🔐 Xác thực
│  ├─ /auth/login
│  ├─ /auth/register
│  ├─ /auth/forgot-password
│  ├─ /auth/reset-password
│  └─ /auth/verify-email
│
├─ 🎓 Khóa học
│  ├─ /course-detail/[id]
│  └─ /search
│
├─ 📚 Học tập
│  ├─ /learning/[courseId]
│  └─ /learning/[courseId]/[lectureId]
│
├─ 📝 Quiz
│  ├─ /quiz
│  ├─ /quiz/[quizId]
│  └─ /quiz/[quizId]/result
│
├─ 📰 Blog
│  ├─ /blog
│  └─ /blog/[blogId]
│
├─ 🛒 Giỏ hàng & Thanh toán
│  ├─ /cart
│  ├─ /checkout
│  ├─ /checkout/success
│  ├─ /payment/callback
│  └─ /payment-result
│
├─ 👤 Người dùng
│  ├─ /profile
│  ├─ /dashboard
│  └─ /certificates/[enrollmentId]
│
└─ 👨‍🏫 Giảng viên
   ├─ /instructor
   ├─ /instructor/revenue
   ├─ /instructor/courses
   ├─ /instructor/courses/create
   ├─ /instructor/courses/[id]
   ├─ /instructor/courses/edit/[id]
   ├─ /instructor/courses/sales
   ├─ /instructor/course/[id]
   ├─ /instructor/user/students
   └─ /instructor/comments
```

## Mermaid Diagrams

### 1. Sơ đồ tổng quan (Overview)

```mermaid
graph TB
    Root["/[locale]/<br/>🏠 Client Panel"] 
    
    Root --> Home["🏠 Trang chủ<br/>/"]
    Root --> About["📄 Giới thiệu<br/>/about"]
    Root --> Auth["🔐 Xác thực<br/>/auth"]
    Root --> Courses["🎓 Khóa học"]
    Root --> Learning["📚 Học tập<br/>/learning"]
    Root --> Quiz["📝 Quiz<br/>/quiz"]
    Root --> Blog["📰 Blog<br/>/blog"]
    Root --> Cart["🛒 Giỏ hàng<br/>/cart"]
    Root --> User["👤 Người dùng"]
    Root --> Instructor["👨‍🏫 Giảng viên<br/>/instructor"]
    
    style Root fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style Home fill:#10b981,stroke:#059669,color:#fff
    style About fill:#6366f1,stroke:#4f46e5,color:#fff
    style Auth fill:#ef4444,stroke:#dc2626,color:#fff
    style Courses fill:#f59e0b,stroke:#d97706,color:#fff
    style Learning fill:#06b6d4,stroke:#0891b2,color:#fff
    style Quiz fill:#ec4899,stroke:#db2777,color:#fff
    style Blog fill:#14b8a6,stroke:#0d9488,color:#fff
    style Cart fill:#f97316,stroke:#ea580c,color:#fff
    style User fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Instructor fill:#64748b,stroke:#475569,color:#fff
```

### 2. Sơ đồ chi tiết - Xác thực (Authentication)

```mermaid
graph LR
    Auth["🔐 Xác thực<br/>/auth"] --> Login["🔑 Đăng nhập<br/>/auth/login"]
    Auth --> Register["📝 Đăng ký<br/>/auth/register"]
    Auth --> Forgot["🔓 Quên mật khẩu<br/>/auth/forgot-password"]
    Auth --> Reset["🔄 Đặt lại<br/>/auth/reset-password"]
    Auth --> Verify["✉️ Xác thực email<br/>/auth/verify-email"]
    
    style Auth fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style Login fill:#f87171,stroke:#ef4444,color:#fff
    style Register fill:#f87171,stroke:#ef4444,color:#fff
    style Forgot fill:#f87171,stroke:#ef4444,color:#fff
    style Reset fill:#f87171,stroke:#ef4444,color:#fff
    style Verify fill:#f87171,stroke:#ef4444,color:#fff
```

### 3. Sơ đồ chi tiết - Khóa học & Học tập

```mermaid
graph TD
    Courses["🎓 Khóa học"] --> CourseDetail["📖 Chi tiết<br/>/course-detail/[id]"]
    Courses --> Search["🔍 Tìm kiếm<br/>/search"]
    
    Learning["📚 Học tập<br/>/learning"] --> CoursePage["📚 Khóa học<br/>/learning/[courseId]"]
    Learning --> Lecture["🎥 Bài giảng<br/>/learning/[courseId]/[lectureId]"]
    
    style Courses fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style CourseDetail fill:#fbbf24,stroke:#f59e0b,color:#fff
    style Search fill:#fbbf24,stroke:#f59e0b,color:#fff
    style Learning fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff
    style CoursePage fill:#22d3ee,stroke:#06b6d4,color:#fff
    style Lecture fill:#22d3ee,stroke:#06b6d4,color:#fff
```

### 4. Sơ đồ chi tiết - Quiz

```mermaid
graph TD
    Quiz["📝 Quiz<br/>/quiz"] --> QuizList["📋 Danh sách<br/>/quiz"]
    Quiz --> QuizDetail["✍️ Làm bài<br/>/quiz/[quizId]"]
    Quiz --> QuizResult["📊 Kết quả<br/>/quiz/[quizId]/result"]
    
    QuizList --> QuizDetail
    QuizDetail --> QuizResult
    
    style Quiz fill:#ec4899,stroke:#db2777,stroke-width:2px,color:#fff
    style QuizList fill:#f472b6,stroke:#ec4899,color:#fff
    style QuizDetail fill:#f472b6,stroke:#ec4899,color:#fff
    style QuizResult fill:#f472b6,stroke:#ec4899,color:#fff
```

### 5. Sơ đồ chi tiết - Giỏ hàng & Thanh toán

```mermaid
graph LR
    Cart["🛒 Giỏ hàng<br/>/cart"] --> Checkout["💳 Thanh toán<br/>/checkout"]
    Checkout --> Success["✅ Thành công<br/>/checkout/success"]
    Checkout --> Callback["🔄 Callback<br/>/payment/callback"]
    Callback --> Result["📄 Kết quả<br/>/payment-result"]
    
    style Cart fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    style Checkout fill:#fb923c,stroke:#f97316,color:#fff
    style Success fill:#fb923c,stroke:#f97316,color:#fff
    style Callback fill:#fb923c,stroke:#f97316,color:#fff
    style Result fill:#fb923c,stroke:#f97316,color:#fff
```

### 6. Sơ đồ chi tiết - Người dùng

```mermaid
graph TD
    User["👤 Người dùng"] --> Profile["👤 Hồ sơ<br/>/profile"]
    User --> Dashboard["📊 Dashboard<br/>/dashboard"]
    User --> Certificates["🏆 Chứng chỉ<br/>/certificates/[enrollmentId]"]
    
    Profile --> ProfileTab["?tab=profile"]
    Profile --> LearningTab["?tab=my-learning"]
    Profile --> WishlistTab["?tab=wishlist"]
    
    style User fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    style Profile fill:#a78bfa,stroke:#8b5cf6,color:#fff
    style Dashboard fill:#a78bfa,stroke:#8b5cf6,color:#fff
    style Certificates fill:#a78bfa,stroke:#8b5cf6,color:#fff
    style ProfileTab fill:#c4b5fd,stroke:#a78bfa,color:#000
    style LearningTab fill:#c4b5fd,stroke:#a78bfa,color:#000
    style WishlistTab fill:#c4b5fd,stroke:#a78bfa,color:#000
```

### 7. Sơ đồ chi tiết - Giảng viên (Instructor)

```mermaid
graph TD
    Instructor["👨‍🏫 Giảng viên<br/>/instructor"] --> Dashboard["📊 Tổng quan<br/>/instructor"]
    Instructor --> Revenue["💰 Doanh thu<br/>/instructor/revenue"]
    Instructor --> Courses["📚 Khóa học<br/>/instructor/courses"]
    Instructor --> Students["👥 Học viên<br/>/instructor/user/students"]
    Instructor --> Comments["💬 Bình luận<br/>/instructor/comments"]
    
    Courses --> CourseList["📋 Danh sách<br/>/instructor/courses"]
    Courses --> CourseCreate["➕ Tạo mới<br/>/instructor/courses/create"]
    Courses --> CourseDetail["👁️ Chi tiết<br/>/instructor/courses/[id]"]
    Courses --> CourseEdit["✏️ Chỉnh sửa<br/>/instructor/courses/edit/[id]"]
    Courses --> CourseSales["🎯 Quản lý sale<br/>/instructor/courses/sales"]
    
    style Instructor fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff
    style Dashboard fill:#94a3b8,stroke:#64748b,color:#fff
    style Revenue fill:#94a3b8,stroke:#64748b,color:#fff
    style Courses fill:#94a3b8,stroke:#64748b,color:#fff
    style Students fill:#94a3b8,stroke:#64748b,color:#fff
    style Comments fill:#94a3b8,stroke:#64748b,color:#fff
    style CourseList fill:#cbd5e1,stroke:#94a3b8,color:#000
    style CourseCreate fill:#cbd5e1,stroke:#94a3b8,color:#000
    style CourseDetail fill:#cbd5e1,stroke:#94a3b8,color:#000
    style CourseEdit fill:#cbd5e1,stroke:#94a3b8,color:#000
    style CourseSales fill:#cbd5e1,stroke:#94a3b8,color:#000
```

### 8. Sơ đồ đầy đủ (Full Sitemap)

```mermaid
graph TB
    Client["/[locale]/"] 
    
    Client --> Home["🏠 /"]
    Client --> About["📄 /about"]
    
    Client --> Auth["🔐 /auth"]
    Auth --> A1["login"]
    Auth --> A2["register"]
    Auth --> A3["forgot-password"]
    Auth --> A4["reset-password"]
    Auth --> A5["verify-email"]
    
    Client --> CourseDetail["🎓 /course-detail/[id]"]
    Client --> Search["🔍 /search"]
    
    Client --> Learning["📚 /learning"]
    Learning --> L1["[courseId]"]
    Learning --> L2["[courseId]/[lectureId]"]
    
    Client --> Quiz["📝 /quiz"]
    Quiz --> Q1["/"]
    Quiz --> Q2["[quizId]"]
    Quiz --> Q3["[quizId]/result"]
    
    Client --> Blog["📰 /blog"]
    Blog --> B1["/"]
    Blog --> B2["[blogId]"]
    
    Client --> Cart["🛒 /cart"]
    Client --> Checkout["💳 /checkout"]
    Client --> CheckoutSuccess["✅ /checkout/success"]
    Client --> PaymentCallback["🔄 /payment/callback"]
    Client --> PaymentResult["📄 /payment-result"]
    
    Client --> Profile["👤 /profile"]
    Client --> UserDashboard["📊 /dashboard"]
    Client --> Certificates["🏆 /certificates/[enrollmentId]"]
    
    Client --> Instructor["👨‍🏫 /instructor"]
    Instructor --> I1["/"]
    Instructor --> I2["revenue"]
    Instructor --> I3["courses"]
    Instructor --> I4["courses/create"]
    Instructor --> I5["courses/[id]"]
    Instructor --> I6["courses/edit/[id]"]
    Instructor --> I7["courses/sales"]
    Instructor --> I8["user/students"]
    Instructor --> I9["comments"]
    
    style Client fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style Home fill:#10b981,stroke:#059669,color:#fff
    style Auth fill:#ef4444,stroke:#dc2626,color:#fff
    style Learning fill:#06b6d4,stroke:#0891b2,color:#fff
    style Quiz fill:#ec4899,stroke:#db2777,color:#fff
    style Cart fill:#f97316,stroke:#ea580c,color:#fff
    style Profile fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Instructor fill:#64748b,stroke:#475569,color:#fff
```

### 9. Mindmap Style

```mermaid
mindmap
  root((Client Panel))
    Home
    About
    Auth
      Login
      Register
      Forgot Password
      Reset Password
      Verify Email
    Courses
      Course Detail
      Search
    Learning
      Course Page
      Lecture
    Quiz
      List
      Detail
      Result
    Blog
      List
      Detail
    Cart & Payment
      Cart
      Checkout
      Success
      Callback
      Result
    User
      Profile
        Profile Tab
        My Learning Tab
        Wishlist Tab
      Dashboard
      Certificates
    Instructor
      Dashboard
      Revenue
      Courses
        List
        Create
        Detail
        Edit
        Sales
      Students
      Comments
```

### 10. User Flow - Mua khóa học

```mermaid
flowchart TD
    Start([Tìm khóa học]) --> Search[Search Page]
    Search --> Detail[Course Detail]
    Detail --> AddCart{Thêm vào giỏ?}
    AddCart -->|Yes| Cart[Cart Page]
    AddCart -->|No| Detail
    Cart --> Checkout[Checkout Page]
    Checkout --> Payment{Thanh toán}
    Payment -->|VNPay| Callback[Payment Callback]
    Payment -->|Success| Success[Checkout Success]
    Payment -->|Fail| Result[Payment Result]
    Callback --> Success
    Success --> Learning[Learning Page]
    Learning --> Lecture[Lecture Detail]
    
    style Start fill:#10b981,stroke:#059669,color:#fff
    style Search fill:#f59e0b,stroke:#d97706,color:#fff
    style Detail fill:#f59e0b,stroke:#d97706,color:#fff
    style Cart fill:#f97316,stroke:#ea580c,color:#fff
    style Checkout fill:#f97316,stroke:#ea580c,color:#fff
    style Success fill:#10b981,stroke:#059669,color:#fff
    style Learning fill:#06b6d4,stroke:#0891b2,color:#fff
    style Lecture fill:#06b6d4,stroke:#0891b2,color:#fff
```

### 11. User Flow - Làm Quiz

```mermaid
flowchart TD
    Start([Vào trang Quiz]) --> List[Quiz List]
    List --> Select[Chọn Quiz]
    Select --> Detail[Quiz Detail]
    Detail --> Answer[Làm bài]
    Answer --> Submit{Nộp bài?}
    Submit -->|Yes| Result[Quiz Result]
    Submit -->|No| Answer
    Result --> List
    
    style Start fill:#ec4899,stroke:#db2777,color:#fff
    style List fill:#f472b6,stroke:#ec4899,color:#fff
    style Detail fill:#f472b6,stroke:#ec4899,color:#fff
    style Answer fill:#f472b6,stroke:#ec4899,color:#fff
    style Result fill:#10b981,stroke:#059669,color:#fff
```

## Thống kê

- **Tổng số routes chính**: 10 modules
- **Tổng số pages**: 40+ pages
- **Public routes**: ~15 routes (không cần đăng nhập)
- **Protected routes**: ~10 routes (cần đăng nhập)
- **Instructor routes**: ~10 routes (chỉ giảng viên)
- **Auth routes**: 5 routes

## Phân loại theo quyền truy cập

### Public (Không cần đăng nhập)
- 🟢 **Home** - Trang chủ
- 🟢 **About** - Giới thiệu
- 🟢 **Auth** - Tất cả trang xác thực
- 🟢 **Course Detail** - Chi tiết khóa học
- 🟢 **Search** - Tìm kiếm
- 🟢 **Blog** - Danh sách và chi tiết
- 🟢 **Quiz List** - Danh sách quiz

### Protected (Cần đăng nhập)
- 🔒 **Learning** - Học khóa học
- 🔒 **Quiz Detail/Result** - Làm quiz
- 🔒 **Cart** - Giỏ hàng
- 🔒 **Checkout** - Thanh toán
- 🔒 **Profile** - Hồ sơ
- 🔒 **Dashboard** - Bảng điều khiển
- 🔒 **Certificates** - Chứng chỉ

### Instructor Only (Chỉ giảng viên)
- 👨‍🏫 **Instructor Dashboard** - Tất cả routes `/instructor/*`
- 👨‍🏫 **Course Management** - Quản lý khóa học
- 👨‍🏫 **Revenue** - Quản lý doanh thu
- 👨‍🏫 **Students** - Quản lý học viên
- 👨‍🏫 **Comments** - Quản lý bình luận

## Routes đặc biệt

- **Profile tabs**: Sử dụng query params `?tab=profile|my-learning|wishlist`
- **Payment callback**: Xử lý callback từ VNPay gateway
- **Learning routes**: Dynamic routes với `[courseId]` và `[lectureId]`
- **Instructor course routes**: Có 2 routes cho chi tiết (`/courses/[id]` và `/course/[id]`)

