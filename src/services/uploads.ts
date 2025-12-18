import api from "./api";

export async function uploadImage(
  file: File,
  endpoint: string = "/uploads/image",
  opts: {
    timeoutMs?: number;
    onProgress?: (progress: number) => void;
    fieldName?: string;
  } = {}
): Promise<{ url: string }> {
  if (!file || file.size === 0) throw new Error("Không có file hợp lệ");
  const fd = new FormData();
  const name = opts.fieldName || "file";
  fd.append(name, file, (file as any).name || "upload.jpg");
  try {
    const res = await api.post(endpoint, fd, {
      timeout: opts.timeoutMs ?? 120000,
      maxContentLength: Infinity as any,
      maxBodyLength: Infinity as any,
      headers: { "Content-Type": undefined as any, Accept: "application/json" },
      onUploadProgress: (evt: any) => {
        if (opts.onProgress && evt.total) {
          const p = Math.round((evt.loaded / evt.total) * 100);
          opts.onProgress(p);
        }
      },
    });
    const data: any = res?.data;
    let url =
      data?.data?.avatar ||
      data?.avatar ||
      data?.imageUrl ||
      data?.secure_url ||
      data?.data?.secure_url ||
      data?.data?.url ||
      data?.result?.url ||
      data?.data?.[0]?.url;
    if (!url) throw new Error("Upload không trả về URL");
    return { url };
  } catch (err: any) {
    const status = err?.response?.status;
    const serverMsg = err?.response?.data?.message;
    const msg = serverMsg || err?.message || "Lỗi upload";
    if (status) throw new Error(`${status}: ${msg}`);
    throw new Error(msg);
  }
}

export async function uploadVideo(
  file: File,
  endpoint: string = "/uploads/video",
  opts: {
    timeoutMs?: number;
    onProgress?: (progress: number) => void;
    fieldName?: string;
  } = {}
): Promise<{ url: string; durationSeconds?: number; thumbnailUrl?: string }> {
  if (!file || file.size === 0) throw new Error("Không có file hợp lệ");
  const fd = new FormData();
  const name = opts.fieldName || "file";
  fd.append(name, file, (file as any).name || "video.mp4");
  try {
    const res = await api.post(endpoint, fd, {
      timeout: opts.timeoutMs ?? 10 * 60 * 1000,
      maxContentLength: Infinity as any,
      maxBodyLength: Infinity as any,
      headers: { "Content-Type": undefined as any, Accept: "application/json" },
      onUploadProgress: (evt: any) => {
        if (opts.onProgress && evt.total) {
          const p = Math.round((evt.loaded / evt.total) * 100);
          opts.onProgress(p);
        }
      },
    });
    const data: any = res?.data;

    console.log("🎥 Upload video response (full):", JSON.stringify(data, null, 2));
    console.log("🎥 Response structure check:", {
      hasData: !!data?.data,
      hasUrl: !!data?.url,
      hasVideoUrl: !!data?.videoUrl,
      hasResult: !!data?.result,
      dataKeys: data?.data ? Object.keys(data.data) : [],
      rootKeys: Object.keys(data || {}),
    });

    // Try multiple possible URL locations with detailed logging
    let url = null;
    const urlCandidates = [
      { path: 'data.url', value: data?.data?.url },
      { path: 'data.videoUrl', value: data?.data?.videoUrl },
      { path: 'data.fileUrl', value: data?.data?.fileUrl },
      { path: 'data.secure_url', value: data?.data?.secure_url },
      { path: 'url', value: data?.url },
      { path: 'videoUrl', value: data?.videoUrl },
      { path: 'fileUrl', value: data?.fileUrl },
      { path: 'secure_url', value: data?.secure_url },
      { path: 'result.url', value: data?.result?.url },
      { path: 'data[0].url', value: data?.data?.[0]?.url },
      { path: 'video', value: data?.video },
    ];

    console.log("🎥 URL candidates:", urlCandidates);

    for (const candidate of urlCandidates) {
      if (candidate.value && typeof candidate.value === 'string') {
        url = candidate.value;
        console.log(`🎥 Found URL at: ${candidate.path} = ${url}`);
        break;
      }
    }

    // Try duration parsing
    const durationCandidates = [
      { path: 'data.duration', value: data?.data?.duration },
      { path: 'data.durationSeconds', value: data?.data?.durationSeconds },
      { path: 'duration', value: data?.duration },
      { path: 'durationSeconds', value: data?.durationSeconds },
      { path: 'result.duration', value: data?.result?.duration },
      { path: 'meta.duration', value: data?.meta?.duration },
      { path: 'metadata.duration', value: data?.metadata?.duration },
    ];

    let durationSeconds = null;
    for (const candidate of durationCandidates) {
      if (typeof candidate.value === 'number' && candidate.value > 0) {
        durationSeconds = candidate.value;
        console.log(`🎥 Found duration at: ${candidate.path} = ${durationSeconds}`);
        break;
      }
    }

    // Try thumbnail parsing
    const thumbnailCandidates = [
      { path: 'data.thumbnailUrl', value: data?.data?.thumbnailUrl },
      { path: 'data.thumbnail', value: data?.data?.thumbnail },
      { path: 'thumbnailUrl', value: data?.thumbnailUrl },
      { path: 'thumbnail', value: data?.thumbnail },
      { path: 'result.thumbnailUrl', value: data?.result?.thumbnailUrl },
    ];

    let thumbnailUrl = null;
    for (const candidate of thumbnailCandidates) {
      if (candidate.value && typeof candidate.value === 'string') {
        thumbnailUrl = candidate.value;
        console.log(`🎥 Found thumbnail at: ${candidate.path} = ${thumbnailUrl}`);
        break;
      }
    }

    console.log("🎥 Final parsed values:", { url, durationSeconds, thumbnailUrl });

    if (!url) {
      console.error("❌ No valid URL found in response:", data);
      throw new Error("Upload không trả về URL hợp lệ. Kiểm tra console để xem chi tiết response.");
    }
    return {
      url,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    const serverMsg = err?.response?.data?.message;
    const msg = serverMsg || err?.message || "Lỗi upload";
    if (status) throw new Error(`${status}: ${msg}`);
    throw new Error(msg);
  }
}

export async function uploadDocument(
  file: File,
  opts: {
    timeoutMs?: number;
    onProgress?: (progress: number) => void;
    fieldName?: string;
  } = {}
): Promise<{ url: string; fileName: string }> {
  if (!file || file.size === 0) throw new Error("Không có file hợp lệ");

  // Use document endpoint for documents
  const endpoint = "/uploads/document";

  const fd = new FormData();
  const name = opts.fieldName || "file";
  fd.append(name, file, file.name || "document");

  try {
    const res = await api.post(endpoint, fd, {
      timeout: opts.timeoutMs ?? 120000,
      maxContentLength: Infinity as any,
      maxBodyLength: Infinity as any,
      headers: { "Content-Type": undefined as any, Accept: "application/json" },
      onUploadProgress: (evt: any) => {
        if (opts.onProgress && evt.total) {
          const p = Math.round((evt.loaded / evt.total) * 100);
          opts.onProgress(p);
        }
      },
    });

    const data: any = res?.data;
    const url =
      data?.data?.url ||
      data?.data?.secure_url ||
      data?.url ||
      data?.secure_url ||
      data?.result?.url ||
      data?.imageUrl ||
      data?.data?.avatar;

    if (!url) throw new Error("Upload không trả về URL");

    return {
      url,
      fileName: file.name
    };
  } catch (err: any) {
    const status = err?.response?.status;
    const serverMsg = err?.response?.data?.message;
    const msg = serverMsg || err?.message || "Lỗi upload tài liệu";
    if (status) throw new Error(`${status}: ${msg}`);
    throw new Error(msg);
  }
}
