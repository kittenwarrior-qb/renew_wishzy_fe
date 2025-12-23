"use client"

import * as React from "react"
import { Sparkles, Loader2, Zap, Check, Copy, GripHorizontal, RotateCcw, CheckCircle2, X, Maximize2, Minimize2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetDescription,
} from "@/components/ui/sheet"
import { notify } from "@/components/shared/admin/Notifications"
import { cn } from "@/lib/utils"

interface AiBlogAssistantProps {
    title: string
    onSelectContent: (content: string) => void
    onSelectDescription: (desc: string) => void
    onSelectTitle?: (title: string) => void
    onSelectThumbnail?: (url: string) => void
}

export function AiBlogAssistant({ title, onSelectContent, onSelectDescription, onSelectTitle, onSelectThumbnail }: AiBlogAssistantProps) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [result, setResult] = React.useState<{ title?: string; content: string; description: string; image_prompt?: string } | null>(null)
    const [view, setView] = React.useState<'chat' | 'result'>('chat')
    const [messages, setMessages] = React.useState<{ role: 'user' | 'model'; content: string }[]>([])
    const [inputValue, setInputValue] = React.useState("")
    const [isExpanded, setIsExpanded] = React.useState(false)

    const apiKey = 'AIzaSyDTgMQwkszsnR5iwISfmfQ2TmupoGsYuOs'

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMsg = inputValue.trim()
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInputValue("")
        setLoading(true)

        try {
            const chatHistory = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }))

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            ...chatHistory,
                            { role: 'user', parts: [{ text: userMsg }] }
                        ]
                    })
                }
            )

            const data = await response.json()
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này."

            setMessages(prev => [...prev, { role: 'model', content: reply }])
        } catch (error) {
            console.error(error)
            notify({ title: "Lỗi", description: "Không thể gửi tin nhắn", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const generateContent = async () => {
        setLoading(true)
        try {
            // Construct context from chat history + title
            const context = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')
            const prompt = `
            Dựa trên cuộc hội thoại sau và tiêu đề "${title}":
            ---
            ${context}
            ---
            Hãy viết một bài blog chuyên nghiệp, chuẩn SEO bằng tiếng Việt.
            Yêu cầu:
            1. Trả về kết quả dưới định dạng JSON với 4 trường: 
               - "title": Tiêu đề bài viết hấp dẫn, chuẩn SEO (nếu người dùng chưa cung cấp hoặc cần tối ưu).
               - "content": Nội dung HTML chi tiết (bao gồm heading h2, h3, p, strong, ul/li).
               - "description": Mô tả ngắn gọn (meta description) 150-200 ký tự.
               - "image_prompt": Một câu tiếng Anh mô tả ngắn gọn nội dung bài viết để tạo ảnh minh họa (ví dụ: 'futuristic city skyline at sunset, cyberpunk style').
            2. Nội dung phải hấp dẫn, có chiều sâu và cung cấp giá trị cho người đọc.
            3. Đảm bảo mã HTML sạch, không chứa các tag style inline.
            Chỉ trả về duy nhất khối JSON, không kèm văn bản giải thích.`

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-goog-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4000,
                        },
                    }),
                }
            )

            const data = await response.json()
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!text) throw new Error("Không nhận được phản hồi từ AI")

            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) text = jsonMatch[0]

            const parsed = JSON.parse(text)
            setResult(parsed)
            setView('result')
            notify({ title: "Tạo nội dung thành công!", variant: "success" })
        } catch (error: any) {
            console.error("AI Generation Error:", error)
            notify({ title: "Lỗi AI", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleApply = () => {
        if (result) {
            if (result.title && onSelectTitle) onSelectTitle(result.title)

            // Generate and Apply Image
            if (result.image_prompt && onSelectThumbnail) {
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(result.image_prompt)}`
                onSelectThumbnail(imageUrl)
            }

            onSelectContent(result.content)
            onSelectDescription(result.description)
            setOpen(false)
            setResult(null)
            setMessages([])
            notify({ title: "Đã áp dụng nội dung & ảnh vào bài viết", variant: "success" })
        }
    }

    // Scroll to bottom of chat
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {!open && (
                <SheetTrigger asChild>
                    <motion.div
                        drag
                        dragMomentum={false}
                        className="fixed bottom-10 right-10 z-[99999] cursor-grab active:cursor-grabbing group"
                    >
                        <Button
                            size="lg"
                            className="h-14 px-6 gap-3 rounded-full shadow-lg border-2 border-primary/20 hover:border-primary transition-all bg-background text-foreground"
                        >
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            <span className="font-bold flex items-center gap-2">
                                AI Assistant
                                <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-50" />
                            </span>
                        </Button>
                    </motion.div>
                </SheetTrigger>
            )}
            <SheetContent
                side="right"
                className={cn(
                    "w-full flex flex-col p-0 gap-0 transition-all duration-300 ease-in-out z-[99999]",
                    isExpanded ? "sm:max-w-[100%]" : "sm:max-w-[650px]"
                )}
            >
                <SheetHeader className="p-4 border-b bg-muted/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-lg">AI Assistant</SheetTitle>
                                <SheetDescription className="text-xs">Chat để lấy ý tưởng hoặc tạo bài viết ngay</SheetDescription>
                            </div>
                        </div>
                        <Button variant="ghost" className="mr-12" size="icon" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Thu nhỏ" : "Phóng to"}>
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col relative">
                    {view === 'chat' ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-10 space-y-4">
                                        <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                                            <Zap className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Chào bạn! Tôi có thể giúp gì?</p>
                                            <p className="text-sm opacity-70">Hãy cung cấp chủ đề hoặc yêu cầu cụ thể.</p>
                                        </div>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                                            msg.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted text-foreground rounded-bl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start w-full animate-in fade-in slide-in-from-left-2 duration-300 pl-1 mt-2">
                                        <div className="flex items-start gap-3 max-w-[80%]">
                                            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm mt-1">
                                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                            </div>
                                            <div className="space-y-1 bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-border/40">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                                                    <span className="flex gap-1 h-1.5 items-end overflow-hidden pb-0.5">
                                                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Đang phân tích và soạn thảo nội dung...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t bg-background">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex gap-2"
                                >
                                    <input
                                        className="flex-1 bg-muted/50 border rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Nhập tin nhắn..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        disabled={loading}
                                    />
                                    <Button type="submit" size="icon" className="rounded-full" disabled={!inputValue.trim() || loading}>
                                        <Zap className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {result && (
                                <>
                                    {result.title && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">Tiêu đề đề xuất</Badge>
                                                <Button variant="ghost" size="sm" onClick={() => setView('chat')}>
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Quay lại Chat
                                                </Button>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-xl border border-border font-bold text-lg">
                                                {result.title}
                                            </div>
                                        </div>
                                    )}

                                    {result.image_prompt && (
                                        <div className="space-y-3">
                                            <Badge variant="outline">Ảnh minh họa (AI Generated)</Badge>
                                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50 group">
                                                <img
                                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.image_prompt)}`}
                                                    alt="AI Generated"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <p className="text-white text-xs line-clamp-2">{result.image_prompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline">Mô tả SEO</Badge>
                                            {!result.title && (
                                                <Button variant="ghost" size="sm" onClick={() => setView('chat')}>
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Quay lại Chat
                                                </Button>
                                            )}
                                        </div>
                                        <div className="p-4 bg-muted/50 rounded-xl border border-border italic text-sm">
                                            {result.description}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Badge variant="outline">Nội dung bài viết</Badge>
                                        <div className="p-6 bg-background border rounded-xl shadow-sm">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: result.content }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <SheetFooter className="p-4 border-t bg-muted/10">
                    <div className="w-full flex flex-col gap-3">
                        {view === 'chat' ? (
                            <Button
                                onClick={generateContent}
                                size="lg"
                                className="w-full font-bold gap-2 shadow-sm"
                                disabled={loading || (!title && messages.length === 0)}
                            >
                                <Sparkles className="w-4 h-4" />
                                {messages.length > 0 ? "Tạo bài viết từ hội thoại" : "Tạo bài viết ngay"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleApply}
                                size="lg"
                                className="w-full font-bold gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Áp dụng vào bài viết
                            </Button>
                        )}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
