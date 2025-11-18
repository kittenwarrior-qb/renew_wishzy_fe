import api from "./api"

export async function uploadImage(
    file: File,
    endpoint: string = "/uploads/image",
    opts: { timeoutMs?: number; onProgress?: (progress: number) => void; fieldName?: string } = {}
): Promise<{ url: string }> {
    if (!file || file.size === 0) throw new Error("Không có file hợp lệ")
    const fd = new FormData()
    const name = opts.fieldName || "file"
    fd.append(name, file, (file as any).name || "upload.jpg")
    try {
        const res = await api.post(endpoint, fd, {
            timeout: opts.timeoutMs ?? 120000,
            maxContentLength: Infinity as any,
            maxBodyLength: Infinity as any,
            headers: { 'Content-Type': undefined as any, Accept: 'application/json' },
            onUploadProgress: (evt: any) => {
                if (opts.onProgress && evt.total) {
                    const p = Math.round((evt.loaded / evt.total) * 100)
                    opts.onProgress(p)
                }
            },
        })
        const data: any = res?.data
        let url = data?.data?.avatar
            || data?.avatar
            || data?.imageUrl
            || data?.secure_url
            || data?.data?.secure_url
            || data?.data?.url
            || data?.result?.url
            || data?.data?.[0]?.url
        if (!url) throw new Error("Upload không trả về URL")
        return { url }
    } catch (err: any) {
        const status = err?.response?.status
        const serverMsg = err?.response?.data?.message
        const msg = serverMsg || err?.message || "Lỗi upload"
        if (status) throw new Error(`${status}: ${msg}`)
        throw new Error(msg)
    }
}

export async function uploadVideo(
    file: File,
    endpoint: string = "/uploads/video",
    opts: { timeoutMs?: number; onProgress?: (progress: number) => void; fieldName?: string } = {}
): Promise<{ url: string; durationSeconds?: number }> {
    if (!file || file.size === 0) throw new Error("Không có file hợp lệ")
    const fd = new FormData()
    const name = opts.fieldName || "file"
    fd.append(name, file, (file as any).name || "video.mp4")
    try {
        const res = await api.post(endpoint, fd, {
            timeout: opts.timeoutMs ?? 10 * 60 * 1000,
            maxContentLength: Infinity as any,
            maxBodyLength: Infinity as any,
            headers: { 'Content-Type': undefined as any, Accept: 'application/json' },
            onUploadProgress: (evt: any) => {
                if (opts.onProgress && evt.total) {
                    const p = Math.round((evt.loaded / evt.total) * 100)
                    opts.onProgress(p)
                }
            },
        })
        const data: any = res?.data
        const url = data?.url
            || data?.data?.url
            || data?.result?.url
            || data?.data?.[0]?.url
            || data?.video
        const durationSeconds = data?.duration
            || data?.data?.duration
            || data?.result?.duration
            || data?.meta?.duration
            || data?.metadata?.duration
        if (!url) throw new Error("Upload không trả về URL")
        return { url, durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : undefined }
    } catch (err: any) {
        const status = err?.response?.status
        const serverMsg = err?.response?.data?.message
        const msg = serverMsg || err?.message || "Lỗi upload"
        if (status) throw new Error(`${status}: ${msg}`)
        throw new Error(msg)
    }
}
