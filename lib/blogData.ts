export interface Comment {
  id: string
  author: string
  date: string
  content: string
  avatar?: string
  likes?: number
}

export interface Blog {
  id: string
  categoryBlog: string
  title: string
  description: string
  image: string
  author: string
  authorBio?: string
  date: string
  readTime: string
  tags?: string[]
  content: string
  comments?: Comment[]
}

export const blogData: Blog[] = [
  {
    id: "1",
    categoryBlog: "getting-started-shadcn-ui",
    title: "Bắt Đầu Với Các Component shadcn/ui",
    description:
      "Tìm hiểu cách tích hợp và tùy chỉnh các component shadcn/ui trong dự án Next.js của bạn.",
    image:
      "https://assets.lummi.ai/assets/QmSF4wkudctbvGGdNm7pwwDZfbs2GRxouzxFgZvDK3vTas?auto=format&w=1500",
    author: "Nguyễn Văn A",
    authorBio: "Frontend Developer, yêu thích Next.js và UI Systems.",
    date: "20 Tháng 11, 2024",
    readTime: "5 phút đọc",
    tags: ["shadcn/ui", "nextjs", "tailwind"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c1-1",
        author: "Hoàng Minh",
        date: "21 Tháng 11, 2024",
        content: "Bài viết rất dễ hiểu, mình làm theo là chạy được ngay 👍",
        avatar: "/avatars/user1.png",
        likes: 2
      },
      {
        id: "c1-2",
        author: "Lan Anh",
        date: "22 Tháng 11, 2024",
        content: "Phần giải thích theme rất hữu ích, cảm ơn tác giả!",
        likes: 2
      }
    ]
  },

  {
    id: "2",
    categoryBlog: "building-accessible-web-apps",
    title: "Xây Dựng Ứng Dụng Web Dễ Tiếp Cận",
    description:
      "Khám phá cách tạo trải nghiệm web toàn diện với accessibility.",
    image:
      "https://assets.lummi.ai/assets/QmXXeMW7hwXnQvyhHBPiHFMGQHmh7UYQtWYFHAdvNrpYzW?auto=format&w=1500",
    author: "Trần Thị B",
    date: "18 Tháng 11, 2024",
    readTime: "7 phút đọc",
    tags: ["accessibility", "aria", "a11y"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c2-1",
        author: "Tuấn Anh",
        date: "19 Tháng 11, 2024",
        content: "Mình hay bỏ qua a11y, đọc bài này mới thấy thiếu sót.",
        likes: 3
      },
      {
        id: "c2-2",
        author: "Phương Linh",
        date: "20 Tháng 11, 2024",
        content: "Có ví dụ ARIA rất thực tế 👌",
        likes: 3
      }
    ]
  },

  {
    id: "3",
    categoryBlog: "modern-design-systems-tailwind",
    title: "Hệ Thống Thiết Kế Hiện Đại Với Tailwind CSS",
    description:
      "Tạo design system có khả năng mở rộng với Tailwind và shadcn/ui.",
    image:
      "https://assets.lummi.ai/assets/QmaE3ByjEoMpBcY7EDfza1h9aQXKFfv1asXwFVT3prgdbv?auto=format&w=1500",
    author: "Lê Văn C",
    date: "15 Tháng 11, 2024",
    readTime: "8 phút đọc",
    tags: ["design-system", "tailwind"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c3-1",
        author: "Hải Đăng",
        date: "16 Tháng 11, 2024",
        content: "Design tokens giải thích rất rõ ràng."
      },
      {
        id: "c3-2",
        author: "Ngọc Mai",
        date: "17 Tháng 11, 2024",
        content: "Mình đang build design system, bài này đúng thứ mình cần."
      }
    ]
  },

  {
    id: "4",
    categoryBlog: "nextjs-13-app-router",
    title: "Làm Chủ App Router Trong Next.js 13+",
    description:
      "Hiểu rõ App Router, Server Components và layout trong Next.js.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/nextjs-app-router.jpg?auto=format&w=1500",
    author: "Phạm Thị D",
    date: "12 Tháng 11, 2024",
    readTime: "10 phút đọc",
    tags: ["nextjs", "app-router"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c4-1",
        author: "Minh Quân",
        date: "13 Tháng 11, 2024",
        content: "Đọc xong là hiểu ngay sự khác nhau giữa pages và app router."
      },
      {
        id: "c4-2",
        author: "Thanh Tâm",
        date: "14 Tháng 11, 2024",
        content: "Server Component đúng là game changer."
      }
    ]
  },

  {
    id: "5",
    categoryBlog: "typescript-advanced-patterns",
    title: "Các Mẫu Thiết Kế Nâng Cao Với TypeScript",
    description:
      "Generics, Utility Types và các pattern nâng cao.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/typescript-advanced.jpg?auto=format&w=1500",
    author: "Nguyễn Văn E",
    date: "10 Tháng 11, 2024",
    readTime: "12 phút đọc",
    tags: ["typescript", "advanced"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c5-1",
        author: "Bảo Long",
        date: "11 Tháng 11, 2024",
        content: "Ví dụ Generics rất dễ hiểu."
      },
      {
        id: "c5-2",
        author: "Khánh Vy",
        date: "12 Tháng 11, 2024",
        content: "Mong có thêm bài về conditional types."
      }
    ]
  },

  {
    id: "6",
    categoryBlog: "react-server-components",
    title: "Hiểu Rõ Về React Server Components",
    description:
      "Cách React Server Components cải thiện hiệu suất.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/react-server-components.jpg?auto=format&w=1500",
    author: "Trần Văn F",
    date: "8 Tháng 11, 2024",
    readTime: "9 phút đọc",
    tags: ["react", "server-components"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c6-1",
        author: "Đức Anh",
        date: "9 Tháng 11, 2024",
        content: "Giờ mới hiểu vì sao bundle nhẹ hơn."
      },
      {
        id: "c6-2",
        author: "Thảo Nhi",
        date: "10 Tháng 11, 2024",
        content: "Bài viết giải thích rất dễ tiếp cận."
      }
    ]
  },

  {
    id: "7",
    categoryBlog: "tailwind-vs-css-modules",
    title: "So Sánh Giữa Tailwind CSS Và CSS Modules",
    description:
      "Ưu nhược điểm của Tailwind và CSS Modules.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/tailwind-vs-css-modules.jpg?auto=format&w=1500",
    author: "Lê Thị G",
    date: "5 Tháng 11, 2024",
    readTime: "11 phút đọc",
    tags: ["tailwind", "css"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c7-1",
        author: "Quốc Bảo",
        date: "6 Tháng 11, 2024",
        content: "Team mình đang tranh luận đúng chủ đề này 😂"
      },
      {
        id: "c7-2",
        author: "Mai Phương",
        date: "7 Tháng 11, 2024",
        content: "So sánh rất công tâm."
      }
    ]
  },

  {
    id: "8",
    categoryBlog: "state-management-2024",
    title: "Quản Lý State Hiện Đại Năm 2024",
    description:
      "So sánh Context, Zustand, Jotai và xu hướng mới.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/state-management.jpg?auto=format&w=1500",
    author: "Phạm Văn H",
    date: "1 Tháng 11, 2024",
    readTime: "14 phút đọc",
    tags: ["state-management", "react"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c8-1",
        author: "Anh Tuấn",
        date: "2 Tháng 11, 2024",
        content: "Zustand đúng là nhẹ thật."
      },
      {
        id: "c8-2",
        author: "Ngọc Hân",
        date: "3 Tháng 11, 2024",
        content: "Bảng so sánh rất trực quan."
      }
    ]
  },

  {
    id: "9",
    categoryBlog: "microfrontends-architecture",
    title: "Kiến Trúc Microfrontends: Từ Cơ Bản Đến Nâng Cao",
    description:
      "Xây dựng ứng dụng lớn với microfrontends.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/microfrontends.jpg?auto=format&w=1500",
    author: "Nguyễn Thị K",
    date: "28 Tháng 10, 2024",
    readTime: "15 phút đọc",
    tags: ["microfrontends", "architecture"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c9-1",
        author: "Hoài Nam",
        date: "29 Tháng 10, 2024",
        content: "Module Federation giải thích rất rõ."
      },
      {
        id: "c9-2",
        author: "Thu Trang",
        date: "30 Tháng 10, 2024",
        content: "Bài này phù hợp cho team lớn."
      }
    ]
  },

  {
    id: "10",
    categoryBlog: "web-performance-optimization",
    title: "Tối Ưu Hiệu Năng Web: Kỹ Thuật Và Công Cụ",
    description:
      "Cải thiện Core Web Vitals và UX.",
    image:
      "https://assets.lummi.ai/assets/QmXx5fKzLJj8vUe9dGfFb4A/web-performance.jpg?auto=format&w=1500",
    author: "Trần Văn L",
    date: "25 Tháng 10, 2024",
    readTime: "13 phút đọc",
    tags: ["performance", "web-vitals"],
    content: `
      <h2>Giới thiệu</h2>
      <p>
        Next.js 15 mang đến nhiều cải tiến mạnh mẽ về hiệu năng, routing và trải nghiệm
        developer. Trong bài viết này, chúng ta sẽ cùng nhau khám phá những điểm nổi bật
        nhất và lý do vì sao bạn nên nâng cấp.
      </p>

      <h2>1. App Router ngày càng ổn định</h2>
      <p>
        App Router tiếp tục được hoàn thiện với khả năng xử lý Server Components tốt hơn,
        giảm bundle phía client và cải thiện thời gian tải trang.
      </p>

      <blockquote>
        App Router là tương lai của Next.js – vừa mạnh, vừa tối ưu SEO.
      </blockquote>

      <h2>2. Xử lý dữ liệu và caching thông minh</h2>
      <p>
        Next.js 15 tối ưu lại cơ chế caching, giúp kiểm soát tốt hơn giữa dữ liệu động
        và dữ liệu tĩnh.
      </p>

      <pre>
        <code>
export const dynamic = "force-dynamic";
        </code>
      </pre>

      <h2>3. Trải nghiệm developer tốt hơn</h2>
      <ul>
        <li>Fast Refresh ổn định hơn</li>
        <li>Error message rõ ràng</li>
        <li>Hỗ trợ TypeScript tốt hơn</li>
      </ul>

      <h2>Kết luận</h2>
      <p>
        Nếu bạn đang xây dựng ứng dụng React hiện đại, Next.js 15 là một lựa chọn rất
        đáng để thử. Với hiệu năng tốt, SEO mạnh và hệ sinh thái lớn, nó phù hợp cho
        cả dự án cá nhân lẫn sản phẩm lớn.
      </p>
    `,
    comments: [
      {
        id: "c10-1",
        author: "Gia Huy",
        date: "26 Tháng 10, 2024",
        content: "LCP và CLS giờ mới hiểu rõ."
      },
      {
        id: "c10-2",
        author: "Bích Ngọc",
        date: "27 Tháng 10, 2024",
        content: "Áp dụng xong Lighthouse tăng điểm liền 🚀"
      }
    ]
  }
]
