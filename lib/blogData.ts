export interface Blog {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogData: Blog[] = [
  {
    id: "1",
    slug: "getting-started-shadcn-ui",
    title: "Bắt Đầu Với Các Component shadcn/ui",
    description: "Tìm hiểu cách tích hợp và tùy chỉnh các component shadcn/ui trong dự án Next.js của bạn. Chúng tôi sẽ hướng dẫn cài đặt, thiết lập theme và các phương pháp tốt nhất để xây dựng giao diện hiện đại.",
    image: "https://assets.lummi.ai/assets/QmSF4wkudctbvGGdNm7pwwDZfbs2GRxouzxFgZvDK3vTas?auto=format&w=1500",
    author: "Nguyễn Văn A",
    date: "20 Tháng 11, 2024",
    readTime: "5 phút đọc",
    content: `
      <h2>Giới Thiệu</h2>
      <p>shadcn/ui là một bộ sưu tập các component có thể tái sử dụng được xây dựng bằng Radix UI và Tailwind CSS. Khác với các thư viện component truyền thống, shadcn/ui không phải là một package npm mà bạn cài đặt. Thay vào đó, bạn sao chép và dán code vào dự án của mình.</p>

      <h2>Tại Sao Chọn shadcn/ui?</h2>
      <p>Có nhiều lý do để chọn shadcn/ui cho dự án Next.js của bạn:</p>
      <ul>
        <li><strong>Tùy chỉnh hoàn toàn:</strong> Bạn sở hữu code, có thể chỉnh sửa tùy ý</li>
        <li><strong>Accessible:</strong> Được xây dựng trên Radix UI với hỗ trợ accessibility tốt</li>
        <li><strong>Styling linh hoạt:</strong> Sử dụng Tailwind CSS để styling dễ dàng</li>
        <li><strong>TypeScript:</strong> Hỗ trợ TypeScript đầy đủ</li>
      </ul>

      <h2>Cài Đặt</h2>
      <p>Để bắt đầu với shadcn/ui, bạn cần cài đặt các dependencies cần thiết:</p>
      <pre><code>npx shadcn-ui@latest init</code></pre>
      <p>Lệnh này sẽ thiết lập cấu hình cần thiết và tạo file <code>components.json</code>.</p>

      <h2>Thêm Component</h2>
      <p>Sau khi cài đặt, bạn có thể thêm các component vào dự án:</p>
      <pre><code>npx shadcn-ui@latest add button</code></pre>
      <p>Component sẽ được thêm vào thư mục <code>components/ui</code> của bạn.</p>

      <h2>Tùy Chỉnh Theme</h2>
      <p>shadcn/ui sử dụng CSS variables để quản lý theme. Bạn có thể tùy chỉnh màu sắc trong file <code>globals.css</code>:</p>
      <pre><code>:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}</code></pre>

      <h2>Kết Luận</h2>
      <p>shadcn/ui là một lựa chọn tuyệt vời cho việc xây dựng UI hiện đại với Next.js. Với khả năng tùy chỉnh cao và hỗ trợ accessibility tốt, nó giúp bạn tạo ra các ứng dụng web chất lượng cao một cách nhanh chóng.</p>
    `
  },
  {
    id: "2",
    slug: "building-accessible-web-apps",
    title: "Xây Dựng Ứng Dụng Web Dễ Tiếp Cận",
    description: "Khám phá cách tạo trải nghiệm web toàn diện bằng các component có khả năng tiếp cận của shadcn/ui. Tìm hiểu các mẹo thực tế để triển khai ARIA labels, điều hướng bàn phím và HTML ngữ nghĩa.",
    image: "https://assets.lummi.ai/assets/QmXXeMW7hwXnQvyhHBPiHFMGQHmh7UYQtWYFHAdvNrpYzW?auto=format&w=1500",
    author: "Trần Thị B",
    date: "18 Tháng 11, 2024",
    readTime: "7 phút đọc",
    content: `
      <h2>Tầm Quan Trọng Của Accessibility</h2>
      <p>Accessibility (khả năng tiếp cận) không chỉ là một tính năng bổ sung mà là một phần thiết yếu của việc phát triển web hiện đại. Nó đảm bảo rằng mọi người, bao gồm cả người khuyết tật, đều có thể sử dụng ứng dụng của bạn.</p>

      <h2>ARIA Labels và Roles</h2>
      <p>ARIA (Accessible Rich Internet Applications) cung cấp các thuộc tính để làm cho nội dung web dễ tiếp cận hơn:</p>
      <ul>
        <li><strong>aria-label:</strong> Cung cấp nhãn cho các element</li>
        <li><strong>aria-describedby:</strong> Liên kết element với mô tả</li>
        <li><strong>role:</strong> Xác định vai trò của element</li>
      </ul>

      <h2>Điều Hướng Bàn Phím</h2>
      <p>Đảm bảo ứng dụng của bạn có thể được điều hướng hoàn toàn bằng bàn phím:</p>
      <ul>
        <li>Tab để di chuyển giữa các element có thể focus</li>
        <li>Enter/Space để kích hoạt buttons và links</li>
        <li>Arrow keys để điều hướng trong menus và lists</li>
        <li>Escape để đóng modals và dropdowns</li>
      </ul>

      <h2>Semantic HTML</h2>
      <p>Sử dụng các thẻ HTML ngữ nghĩa giúp screen readers hiểu cấu trúc trang:</p>
      <pre><code>&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;article&gt;, &lt;section&gt;, &lt;footer&gt;</code></pre>

      <h2>Testing Accessibility</h2>
      <p>Sử dụng các công cụ như axe DevTools, Lighthouse, và WAVE để kiểm tra accessibility của ứng dụng.</p>

      <h2>Kết Luận</h2>
      <p>Xây dựng ứng dụng web dễ tiếp cận không chỉ là đúng đắn về mặt đạo đức mà còn mở rộng đối tượng người dùng của bạn. shadcn/ui giúp việc này trở nên dễ dàng hơn với các component được xây dựng sẵn với accessibility.</p>
    `
  },
  {
    id: "3",
    slug: "modern-design-systems-tailwind",
    title: "Hệ Thống Thiết Kế Hiện Đại Với Tailwind CSS",
    description: "Tìm hiểu cách tạo hệ thống thiết kế có khả năng mở rộng bằng Tailwind CSS và shadcn/ui. Học cách duy trì tính nhất quán trong khi xây dựng thư viện component linh hoạt và dễ bảo trì.",
    image: "https://assets.lummi.ai/assets/QmaE3ByjEoMpBcY7EDfza1h9aQXKFfv1asXwFVT3prgdbv?auto=format&w=1500",
    author: "Lê Văn C",
    date: "15 Tháng 11, 2024",
    readTime: "8 phút đọc",
    content: `
      <h2>Hệ Thống Thiết Kế Là Gì?</h2>
      <p>Hệ thống thiết kế là một bộ sưu tập các component, patterns, và guidelines có thể tái sử dụng giúp đảm bảo tính nhất quán trong toàn bộ sản phẩm.</p>

      <h2>Lợi Ích Của Tailwind CSS</h2>
      <p>Tailwind CSS cung cấp một cách tiếp cận utility-first cho styling:</p>
      <ul>
        <li><strong>Rapid development:</strong> Styling nhanh chóng với utility classes</li>
        <li><strong>Consistency:</strong> Design tokens được định nghĩa sẵn</li>
        <li><strong>Customization:</strong> Dễ dàng tùy chỉnh qua config file</li>
        <li><strong>Performance:</strong> PurgeCSS loại bỏ CSS không sử dụng</li>
      </ul>

      <h2>Thiết Lập Design Tokens</h2>
      <p>Design tokens là các giá trị được định nghĩa trước cho colors, spacing, typography:</p>
      <pre><code>module.exports = {
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
    }
  }
}</code></pre>

      <h2>Component Library</h2>
      <p>Xây dựng thư viện component với shadcn/ui và Tailwind:</p>
      <ul>
        <li>Buttons với các variants khác nhau</li>
        <li>Form inputs với validation</li>
        <li>Cards và layouts</li>
        <li>Navigation components</li>
      </ul>

      <h2>Documentation</h2>
      <p>Tài liệu hóa hệ thống thiết kế của bạn với Storybook hoặc tương tự để team có thể sử dụng dễ dàng.</p>

      <h2>Kết Luận</h2>
      <p>Một hệ thống thiết kế tốt giúp team phát triển nhanh hơn, đảm bảo tính nhất quán, và dễ dàng bảo trì. Tailwind CSS và shadcn/ui là combo hoàn hảo để xây dựng hệ thống thiết kế hiện đại.</p>
    `
  }
];
