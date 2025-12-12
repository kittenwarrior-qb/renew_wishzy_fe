# PHẦN 6 – KIỂM THỬ PHẦN MỀM

## TEST CASE USER

| ID | Request | Priority | Business Value | Acceptance Criteria | State |
|----|---------|----------|----------------|---------------------|-------|
| 1 | Tôi muốn đăng ký bằng Email hợp lệ | 1 | Đảm bảo việc đăng ký tài khoản bằng email hợp lệ | • Mở trang đăng ký<br>• Nhập email hợp lệ, tên người dùng, và mật khẩu<br>• Nhấn nút "Đăng ký bằng Email" | Done |
| 2 | Tôi muốn đăng ký bằng Email không hợp lệ | 2 | Ngăn chặn đăng ký với email không hợp lệ | • Mở trang đăng ký<br>• Nhập email không hợp lệ (ví dụ: không có @)<br>• Hệ thống hiển thị thông báo lỗi | Done |
| 3 | Tôi muốn đăng nhập bằng Email và mật khẩu | 1 | Đảm bảo người dùng có thể đăng nhập vào hệ thống | • Mở trang đăng nhập<br>• Nhập email và mật khẩu đã đăng ký<br>• Nhấn nút "Đăng nhập"<br>• Hệ thống chuyển hướng đến trang chủ | Done |
| 4 | Tôi muốn đăng nhập với thông tin sai | 2 | Bảo mật tài khoản người dùng | • Mở trang đăng nhập<br>• Nhập email hoặc mật khẩu sai<br>• Hệ thống hiển thị thông báo lỗi | Done |
| 5 | Tôi muốn đăng nhập bằng Google | 1 | Tăng trải nghiệm người dùng với đăng nhập nhanh | • Mở trang đăng nhập<br>• Nhấn nút "Đăng nhập bằng Google"<br>• Chọn tài khoản Google<br>• Hệ thống đăng nhập thành công | Done |
| 6 | Tôi muốn quên mật khẩu | 2 | Khôi phục quyền truy cập khi quên mật khẩu | • Mở trang đăng nhập<br>• Nhấn "Quên mật khẩu"<br>• Nhập email đã đăng ký<br>• Nhận email reset mật khẩu | Done |
| 7 | Tôi muốn đặt lại mật khẩu | 2 | Cho phép người dùng tạo mật khẩu mới | • Mở link reset mật khẩu từ email<br>• Nhập mật khẩu mới và xác nhận<br>• Nhấn "Đặt lại mật khẩu"<br>• Đăng nhập với mật khẩu mới thành công | Done |
| 8 | Tôi muốn xác thực email | 2 | Xác minh email người dùng | • Nhận email xác thực sau khi đăng ký<br>• Nhấn link xác thực trong email<br>• Hệ thống xác nhận email đã được xác thực | Done |
| 9 | Tôi muốn xem trang chủ | 1 | Hiển thị nội dung chính của website | • Truy cập trang chủ<br>• Hiển thị các section: Hero, Khóa học nổi bật, Danh mục, Blog, FAQ | Done |
| 10 | Tôi muốn tìm kiếm khóa học | 1 | Giúp người dùng tìm khóa học mong muốn | • Nhập từ khóa vào ô tìm kiếm<br>• Nhấn Enter hoặc nút tìm kiếm<br>• Hiển thị danh sách khóa học liên quan | Done |
| 11 | Tôi muốn lọc khóa học theo danh mục | 2 | Tìm kiếm khóa học theo chủ đề | • Mở trang tìm kiếm<br>• Chọn danh mục từ bộ lọc<br>• Hiển thị chỉ khóa học thuộc danh mục đã chọn | Done |
| 12 | Tôi muốn lọc khóa học theo mức độ | 2 | Tìm khóa học phù hợp với trình độ | • Mở trang tìm kiếm<br>• Chọn mức độ (Beginner/Intermediate/Advanced)<br>• Hiển thị khóa học theo mức độ đã chọn | Done |
| 13 | Tôi muốn xem chi tiết khóa học | 1 | Cung cấp thông tin đầy đủ về khóa học | • Click vào khóa học từ danh sách<br>• Hiển thị: Mô tả, Giảng viên, Chương trình học, Đánh giá, Giá | Done |
| 14 | Tôi muốn thêm khóa học vào giỏ hàng | 1 | Cho phép người dùng mua nhiều khóa học cùng lúc | • Xem chi tiết khóa học<br>• Nhấn nút "Thêm vào giỏ hàng"<br>• Khóa học được thêm vào giỏ hàng | Done |
| 15 | Tôi muốn mua ngay khóa học | 1 | Mua khóa học nhanh chóng | • Xem chi tiết khóa học<br>• Nhấn nút "Mua ngay"<br>• Chuyển đến trang thanh toán | Done |
| 16 | Tôi muốn thêm khóa học vào wishlist | 2 | Lưu khóa học để xem sau | • Xem chi tiết khóa học<br>• Nhấn icon yêu thích<br>• Khóa học được thêm vào wishlist | Done |
| 17 | Tôi muốn xem giỏ hàng | 1 | Xem các khóa học đã thêm vào giỏ | • Nhấn icon giỏ hàng trên header<br>• Hiển thị danh sách khóa học trong giỏ<br>• Hiển thị tổng tiền | Done |
| 18 | Tôi muốn xóa khóa học khỏi giỏ hàng | 2 | Quản lý giỏ hàng linh hoạt | • Mở giỏ hàng<br>• Nhấn nút xóa khóa học<br>• Khóa học được xóa khỏi giỏ hàng | Done |
| 19 | Tôi muốn áp dụng mã giảm giá | 2 | Giảm giá khi thanh toán | • Mở trang thanh toán<br>• Nhập mã giảm giá<br>• Nhấn "Áp dụng"<br>• Giá được giảm theo mã | Done |
| 20 | Tôi muốn thanh toán bằng VNPay | 1 | Hoàn tất giao dịch mua khóa học | • Chọn phương thức thanh toán VNPay<br>• Nhấn "Thanh toán"<br>• Chuyển đến cổng thanh toán VNPay<br>• Hoàn tất thanh toán | Done |
| 21 | Tôi muốn xem kết quả thanh toán | 1 | Xác nhận trạng thái thanh toán | • Sau khi thanh toán<br>• Chuyển về trang kết quả<br>• Hiển thị trạng thái thành công/thất bại | Done |
| 22 | Tôi muốn đăng ký khóa học miễn phí | 1 | Cho phép học khóa học miễn phí | • Xem khóa học miễn phí<br>• Nhấn "Đăng ký miễn phí"<br>• Khóa học được thêm vào "Khóa học của tôi" | Done |
| 23 | Tôi muốn xem danh sách khóa học đang học | 1 | Quản lý khóa học đã đăng ký | • Đăng nhập vào hệ thống<br>• Vào "Khóa học của tôi"<br>• Hiển thị danh sách khóa học đã đăng ký | Done |
| 24 | Tôi muốn tiếp tục học khóa học | 1 | Tiếp tục học từ vị trí đã dừng | • Mở "Khóa học của tôi"<br>• Click vào khóa học<br>• Hiển thị bài giảng tiếp theo cần học | Done |
| 25 | Tôi muốn xem video bài giảng | 1 | Học nội dung khóa học | • Mở khóa học đã đăng ký<br>• Click vào bài giảng<br>• Video được phát<br>• Tiến độ được lưu tự động | Done |
| 26 | Tôi muốn đánh dấu bài giảng đã hoàn thành | 2 | Theo dõi tiến độ học tập | • Xem video bài giảng<br>• Xem hết video<br>• Bài giảng được đánh dấu hoàn thành | Done |
| 27 | Tôi muốn làm bài kiểm tra | 1 | Đánh giá kiến thức đã học | • Mở trang quiz<br>• Chọn bài kiểm tra<br>• Trả lời các câu hỏi<br>• Nộp bài | Done |
| 28 | Tôi muốn xem kết quả bài kiểm tra | 1 | Xem điểm và đáp án | • Sau khi nộp bài<br>• Hiển thị điểm số<br>• Hiển thị đáp án đúng/sai | Done |
| 29 | Tôi muốn xem danh sách bài viết blog | 2 | Đọc tin tức và bài viết | • Truy cập trang blog<br>• Hiển thị danh sách bài viết<br>• Có phân trang | Done |
| 30 | Tôi muốn xem chi tiết bài viết blog | 2 | Đọc nội dung bài viết | • Click vào bài viết<br>• Hiển thị nội dung đầy đủ<br>• Hiển thị tác giả, ngày đăng | Done |
| 31 | Tôi muốn cập nhật thông tin cá nhân | 2 | Quản lý hồ sơ người dùng | • Vào "Hồ sơ"<br>• Chỉnh sửa thông tin<br>• Nhấn "Lưu"<br>• Thông tin được cập nhật | Done |
| 32 | Tôi muốn đổi avatar | 2 | Tùy chỉnh hồ sơ cá nhân | • Vào "Hồ sơ"<br>• Click vào avatar<br>• Chọn ảnh mới<br>• Avatar được cập nhật | Done |
| 33 | Tôi muốn xem wishlist | 2 | Xem các khóa học đã yêu thích | • Vào "Khóa học yêu thích"<br>• Hiển thị danh sách khóa học đã thêm vào wishlist | Done |
| 34 | Tôi muốn xóa khóa học khỏi wishlist | 2 | Quản lý danh sách yêu thích | • Mở wishlist<br>• Nhấn icon yêu thích trên khóa học<br>• Khóa học được xóa khỏi wishlist | Done |
| 35 | Tôi muốn xem chứng chỉ | 2 | Xem chứng chỉ đã hoàn thành | • Hoàn thành khóa học<br>• Vào "Chứng chỉ"<br>• Hiển thị và tải xuống chứng chỉ | Done |
| 36 | Tôi muốn đăng xuất | 1 | Bảo mật tài khoản | • Click vào menu người dùng<br>• Chọn "Đăng xuất"<br>• Quay về trang chủ và không còn đăng nhập | Done |
| 37 | Tôi muốn xem dashboard giảng viên | 1 | Tổng quan thống kê cho giảng viên | • Đăng nhập với tài khoản giảng viên<br>• Vào trang instructor<br>• Hiển thị: Tổng khóa học, Học viên, Doanh thu | Done |
| 38 | Tôi muốn xem doanh thu | 1 | Theo dõi doanh thu khóa học | • Vào "Quản lý doanh thu"<br>• Hiển thị biểu đồ doanh thu theo ngày/tháng/năm<br>• Hiển thị tổng doanh thu | Done |
| 39 | Tôi muốn xem danh sách khóa học của tôi (giảng viên) | 1 | Quản lý khóa học đã tạo | • Vào "Khóa học"<br>• Hiển thị danh sách khóa học đã tạo<br>• Có thể lọc và tìm kiếm | Done |
| 40 | Tôi muốn tạo khóa học mới | 1 | Thêm khóa học vào hệ thống | • Vào "Tạo khóa học"<br>• Điền thông tin: Tên, Mô tả, Giá, Danh mục<br>• Thêm chương và bài giảng<br>• Nhấn "Lưu" | Done |
| 41 | Tôi muốn chỉnh sửa khóa học | 1 | Cập nhật thông tin khóa học | • Vào chi tiết khóa học<br>• Nhấn "Chỉnh sửa"<br>• Cập nhật thông tin<br>• Lưu thay đổi | Done |
| 42 | Tôi muốn quản lý sale cho khóa học | 2 | Tạo chương trình khuyến mãi | • Vào "Quản lý sale"<br>• Chọn khóa học<br>• Thiết lập: Loại giảm giá, Giá trị, Thời gian<br>• Lưu sale | Done |
| 43 | Tôi muốn xem danh sách học viên | 1 | Quản lý học viên đăng ký | • Vào "Học viên"<br>• Hiển thị danh sách học viên<br>• Xem thông tin: Tên, Email, Khóa học đã đăng ký | Done |
| 44 | Tôi muốn quản lý bình luận | 2 | Phản hồi và quản lý bình luận | • Vào "Bình luận"<br>• Hiển thị bình luận của học viên<br>• Có thể trả lời hoặc xóa bình luận | Done |
| 45 | Tôi muốn thay đổi ngôn ngữ | 3 | Hỗ trợ đa ngôn ngữ | • Click vào language switcher<br>• Chọn ngôn ngữ (Tiếng Việt/English)<br>• Giao diện chuyển sang ngôn ngữ đã chọn | Done |
| 46 | Tôi muốn chuyển đổi theme (sáng/tối) | 3 | Tùy chỉnh giao diện | • Click vào theme switcher<br>• Chuyển giữa chế độ sáng và tối<br>• Giao diện được cập nhật ngay lập tức | Done |
| 47 | Tôi muốn xem trang giới thiệu | 3 | Tìm hiểu về Wishzy | • Truy cập trang "Giới thiệu"<br>• Hiển thị thông tin về công ty, dịch vụ | Done |
| 48 | Tôi muốn xem FAQ | 2 | Tìm câu trả lời cho câu hỏi thường gặp | • Scroll đến phần FAQ trên trang chủ<br>• Click vào câu hỏi<br>• Hiển thị câu trả lời | Done |
| 49 | Tôi muốn xem khóa học miễn phí | 2 | Tìm khóa học không mất phí | • Vào trang chủ<br>• Scroll đến phần "Khóa học miễn phí"<br>• Hiển thị danh sách khóa học miễn phí | Done |
| 50 | Tôi muốn xem khóa học nổi bật | 1 | Khám phá khóa học phổ biến | • Vào trang chủ<br>• Scroll đến phần "Khóa học nổi bật"<br>• Hiển thị khóa học được đánh giá cao | Done |
