# Hướng dẫn cấu hình Google Login

## Đã hoàn thành

✅ Cài đặt package `@react-oauth/google`
✅ Tạo GoogleOAuthProvider
✅ Tạo GoogleLoginButton component
✅ Thêm hook useGoogleLogin vào useAuth
✅ Thêm API endpoint googleLogin vào auth service
✅ Tích hợp vào LoginForm và RegisterForm
✅ Wrap app với GoogleOAuthProvider

## Cần làm tiếp

### 1. Lấy Google Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn **Application type**: Web application
6. Thêm **Authorized JavaScript origins**:
   - `http://localhost:3000` (cho development)
   - `https://your-domain.com` (cho production)
7. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000` (cho development)
   - `https://your-domain.com` (cho production)
8. Copy **Client ID**

### 2. Cập nhật file .env

Mở file `.env` và thay thế `your-google-client-id-here` bằng Client ID thực tế:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
```

### 3. Kiểm tra Backend API

Backend cần có endpoint: `POST /auth/google`

Request body:

```json
{
  "credential": "google-jwt-token-here"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "user",
      ...
    },
    "accessToken": "jwt-token"
  },
  "message": "Đăng nhập thành công"
}
```

### 4. Test chức năng

1. Chạy dev server: `npm run dev`
2. Truy cập trang login: `http://localhost:3000/auth/login`
3. Click vào nút Google
4. Chọn tài khoản Google
5. Kiểm tra xem có đăng nhập thành công không

## Cấu trúc files đã tạo

```
├── .env (đã cập nhật)
├── src/
│   ├── providers/
│   │   └── GoogleOAuthProvider.tsx (mới)
│   ├── app/[locale]/layout.tsx (đã cập nhật)
│   └── services/auth.ts (đã cập nhật - thêm googleLogin)
├── components/shared/auth/
│   ├── GoogleLoginButton.tsx (mới)
│   ├── LoginForm.tsx (đã cập nhật)
│   ├── RegisterForm.tsx (đã cập nhật)
│   └── useAuth.ts (đã cập nhật - thêm useGoogleLogin)
└── package.json (đã cập nhật)
```

## Lưu ý

- Google Client ID phải được cấu hình đúng với domain của bạn
- Backend phải verify Google JWT token và tạo user nếu chưa tồn tại
- Nút Google sẽ tự động ẩn nếu không có NEXT_PUBLIC_GOOGLE_CLIENT_ID
