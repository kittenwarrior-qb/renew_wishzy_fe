# Documents Page - Issues Analysis & Solutions

## 🔴 Vấn đề hiện tại

### 1. Kích thước file bị "hack" (Ước lượng giả)

**Vị trí**: `src/services/instructorApi.ts` lines 435-458

**Vấn đề**:
```typescript
const estimateFileSize = (fileUrl: string, fileName: string): number => {
  const baseSizes: Record<string, number> = {
    'pdf': 2 * 1024 * 1024,      // 2MB - HARDCODED!
    'mp4': 50 * 1024 * 1024,     // 50MB - HARDCODED!
    'avi': 100 * 1024 * 1024,    // 100MB - HARDCODED!
  };
  return baseSizes[extension] || 1 * 1024 * 1024;
};
```

**Root Cause**: Backend API `/documents/instructor/my-courses` KHÔNG trả về field `size`. Frontend đang ước lượng dựa trên extension.

**Hậu quả**:
- Kích thước hiển thị KHÔNG CHÍNH XÁC
- Video 10MB hiển thị là 50MB
- Video 200MB cũng hiển thị là 50MB
- User không biết file thực sự nặng bao nhiêu

### 2. Xem trước / Tải xuống không hoạt động

**Vị trí**: `src/app/instructor/documents/page.tsx` lines 300-307

**Code hiện tại**:
```typescript
<DropdownMenuItem onClick={() => window.open(row.url, '_blank')}>
  <Eye className="h-4 w-4 mr-2" />
  Xem trước
</DropdownMenuItem>
<DropdownMenuItem onClick={() => window.open(row.downloadUrl, '_blank')}>
  <Download className="h-4 w-4 mr-2" />
  Tải xuống
</DropdownMenuItem>
```

**Vấn đề**:
1. `row.url` và `row.downloadUrl` đều map từ `doc.fileUrl` (line 502-503 trong instructorApi.ts)
2. `fileUrl` có thể là:
   - URL Cloudinary: `https://res.cloudinary.com/...` - CÓ THỂ xem được
   - URL S3 private: Cần signed URL - KHÔNG xem được trực tiếp
   - Relative path: `/uploads/...` - KHÔNG xem được

**Hậu quả**:
- Click "Xem trước" → Mở tab mới nhưng không load được file
- Click "Tải xuống" → Không tải được hoặc mở trang lỗi

### 3. Giới hạn 10MB quá nhỏ cho video

**Vị trí**: `src/app/instructor/documents/UploadDocumentDialog.tsx` line 76

```typescript
if (file.size > 10 * 1024 * 1024) {
  notify({
    title: "File quá lớn",
    description: "Kích thước file không được vượt quá 10MB",
    variant: "destructive"
  });
  return;
}
```

**Vấn đề**:
- Support video (MP4, AVI) nhưng giới hạn 10MB
- Video thường > 10MB (thậm chí > 100MB)
- User không thể upload video thực tế

### 4. Filter hiện nhiều loại file nhưng API chỉ hỗ trợ PDF & Word

**Vị trí**: `src/app/instructor/documents/page.tsx` lines 199-214

**Code hiện tại**: 14 options (PDF, DOC, DOCX, XLSX, PPTX, TXT, PNG, JPG, JPEG, GIF, MP4, AVI, ZIP, RAR)

**Thực tế backend**: Chỉ hỗ trợ PDF và Word (DOC, DOCX) theo user feedback

**Vấn đề**:
- User chọn filter "MP4" → Kết quả rỗng hoặc không chính xác
- Gây nhầm lẫn về khả năng hỗ trợ

---

## ✅ Giải pháp

### Giải pháp 1: Sửa Backend API (RECOMMENDED)

**Thay đổi Backend**:
```typescript
// Backend cần trả về field 'size' trong Document entity
interface DocumentResponse {
  id: string;
  name: string;
  fileUrl: string;
  size: number;        // ← CẦN THÊM field này
  createdAt: string;
  // ...
}
```

**Lợi ích**:
- ✅ Kích thước CHÍNH XÁC 100%
- ✅ Không cần ước lượng
- ✅ Không cần thay đổi frontend nhiều

**Implementation**:
1. Backend lưu `file.size` khi upload (đã có sẵn khi upload file)
2. Return field `size` trong API response
3. Frontend map trực tiếp: `size: doc.size` (line 501)

### Giải pháp 2: Lấy size từ Cloud Storage (FALLBACK)

Nếu không sửa được backend ngay:

```typescript
const getFileSize = async (fileUrl: string): Promise<number> => {
  try {
    const response = await fetch(fileUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch (error) {
    return estimateFileSize(fileUrl, fileName); // Fallback
  }
};
```

**Nhược điểm**:
- ❌ Tốn thêm HTTP request
- ❌ Có thể bị CORS block
- ❌ Không work với private URLs

### Giải pháp 3: Fix "Xem trước" và "Tải xuống"

**Option A: Sử dụng signed URLs (Backend support)**

```typescript
// Backend tạo endpoint mới
GET /documents/:id/download    → Returns signed/temporary URL
GET /documents/:id/preview     → Returns signed/temporary URL
```

**Frontend**:
```typescript
<DropdownMenuItem onClick={() => handlePreview(row.id)}>
  <Eye className="h-4 w-4 mr-2" />
  Xem trước
</DropdownMenuItem>

const handlePreview = async (docId: string) => {
  try {
    const response = await api.get(`/documents/${docId}/preview`);
    const previewUrl = response.data.url;
    window.open(previewUrl, '_blank');
  } catch (error) {
    notify({ title: "Lỗi", description: "Không thể xem trước file" });
  }
};
```

**Option B: Download qua API endpoint (Đơn giản hơn)**

```typescript
const handleDownload = async (docId: string, fileName: string) => {
  try {
    const response = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    notify({ title: "Lỗi", description: "Không thể tải file" });
  }
};
```

### Giải pháp 4: Tăng giới hạn upload và phân loại

```typescript
// Phân loại giới hạn theo loại file
const getMaxFileSize = (file: File): number => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Documents: 10MB
  if (['pdf', 'doc', 'docx'].includes(extension || '')) {
    return 10 * 1024 * 1024;
  }

  // Videos: 500MB (hoặc không giới hạn nếu dùng chunked upload)
  if (['mp4', 'avi', 'mov'].includes(extension || '')) {
    return 500 * 1024 * 1024;
  }

  // Images: 5MB
  if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) {
    return 5 * 1024 * 1024;
  }

  // Default: 10MB
  return 10 * 1024 * 1024;
};

// Sử dụng
const maxSize = getMaxFileSize(file);
if (file.size > maxSize) {
  notify({
    title: "File quá lớn",
    description: `Kích thước file không được vượt quá ${formatFileSize(maxSize)}`,
    variant: "destructive"
  });
  return;
}
```

### Giải pháp 5: Chỉ giữ lại PDF và Word trong filter

```typescript
<SelectContent>
  <SelectItem value="all">Tất cả loại</SelectItem>
  <SelectItem value="pdf">PDF</SelectItem>
  <SelectItem value="doc">Word (DOC)</SelectItem>
  <SelectItem value="docx">Word (DOCX)</SelectItem>
</SelectContent>
```

---

## 📋 Action Items (Priority Order)

### HIGH PRIORITY

1. **[BACKEND]** Thêm field `size` vào Document entity và API response
2. **[BACKEND]** Tạo endpoint `/documents/:id/download` trả về signed URL hoặc stream file
3. **[FRONTEND]** Update filter chỉ giữ PDF và Word
4. **[FRONTEND]** Fix download handler sử dụng API endpoint thay vì direct URL

### MEDIUM PRIORITY

5. **[FRONTEND]** Tăng giới hạn upload cho video (hoặc phân loại theo file type)
6. **[FRONTEND]** Remove `estimateFileSize` function sau khi backend có field size

### LOW PRIORITY

7. **[BACKEND]** Track download count
8. **[BACKEND]** Hỗ trợ preview cho video/PDF trực tiếp trên browser

---

## 🧪 Testing Checklist

### Test kích thước file
- [ ] Upload file PDF 2MB → Hiển thị đúng 2MB
- [ ] Upload file video MP4 150MB → Hiển thị đúng 150MB
- [ ] Tổng dung lượng statistics hiển thị chính xác

### Test download/preview
- [ ] Click "Tải xuống" PDF → File tải về thành công
- [ ] Click "Xem trước" PDF → Mở PDF viewer
- [ ] Click "Tải xuống" video → File video tải về
- [ ] Click trên các file type khác nhau

### Test upload limits
- [ ] Upload PDF 5MB → Success
- [ ] Upload PDF 15MB → Show error (nếu giới hạn 10MB)
- [ ] Upload video 50MB → Success (nếu tăng limit)
- [ ] Upload video 600MB → Show error (nếu giới hạn 500MB)

### Test filter
- [ ] Filter "Tất cả" → Show all documents
- [ ] Filter "PDF" → Show only PDFs
- [ ] Filter "Word" → Show only DOC/DOCX
- [ ] No results khi filter loại file không có
