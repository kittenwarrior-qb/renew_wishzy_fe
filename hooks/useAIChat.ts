import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

// Message type definition
export type Message = {
    role: 'user' | 'assistant' | 'streaming';
    content: string;
    timestamp: Date;
    id: string;
};

// API configuration type
type ApiConfig = {
    endpoint: string;
    description: string;
    params?: Record<string, any>;
};

export const useAIChat = (userId: string = 'default-user', messagesContainerRef?: RefObject<HTMLDivElement | null>) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortController = useRef<AbortController | null>(null);

    // API configurations
    const apiConfigs: Record<string, ApiConfig> = {
        courses: {
            endpoint: '/vi/courses',
            description: 'khóa học',
            params: { limit: 5, sort: 'popular' }
        },
        categories: {
            endpoint: '/vi/categories',
            description: 'danh mục',
            params: {}
        },
        hotCourses: {
            endpoint: '/vi/stat/hot-courses',
            description: 'khóa học nổi bật',
            params: { limit: 5 }
        }
        // Add more API endpoints as needed
    };

    // Load messages from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !userId) return;

        try {
            const savedMessages = localStorage.getItem(`aiChatMessages_${userId}`);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                // Only load messages that are older than 1 day
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);

                const messagesWithDates = parsedMessages
                    .filter((msg: any) => new Date(msg.timestamp) > oneDayAgo)
                    .map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));

                setMessages(messagesWithDates);
            } else {
                // Initialize with welcome message for new users
                setMessages([{
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
            // Initialize with error message if loading fails
            setMessages([{
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Xin lỗi, đã có lỗi xảy ra khi tải lịch sử trò chuyện.',
                timestamp: new Date()
            }]);
        }
    }, [userId]);

    // Save messages to localStorage when they change
    useEffect(() => {
        if (typeof window === 'undefined' || !userId) return;

        try {
            const messagesToSave = messages
                .filter(msg => msg.role !== 'streaming')
                .slice(-50); // Keep only last 50 messages to prevent localStorage overflow

            localStorage.setItem(`aiChatMessages_${userId}`, JSON.stringify(messagesToSave));
        } catch (error) {
            console.error('Lỗi khi lưu tin nhắn:', error);
        }
    }, [messages, userId]);

    // Auto-scroll to bottom when messages change or when typing
    useEffect(() => {
        if (messagesContainerRef?.current) {
            const scrollToBottom = () => {
                const container = messagesContainerRef.current;
                if (container) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            };

            // Small delay to ensure DOM is updated
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isTyping, messagesContainerRef]);

    const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const clearMessages = useCallback(() => {
        const confirmation = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?');
        if (confirmation) {
            setMessages([{
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Lịch sử trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?',
                timestamp: new Date()
            }]);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`aiChatMessages_${userId}`);
            }
        }
    }, [userId]);

    const fetchDataFromAPI = async (config: ApiConfig): Promise<string> => {
        try {
            const { endpoint, params } = config;
            const queryString = new URLSearchParams(params).toString();
            const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                },
                signal: abortController.current?.signal,
                credentials: 'include' // Important for cookies
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            // Extract data based on response structure
            const items = data.data?.items || data.data || data;
            return JSON.stringify(items, null, 2);
        } catch (error) {
            console.error('Error fetching API data:', error);
            return `Lỗi khi lấy dữ liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`;
        }
    };

    const getRelevantAPIData = async (content: string): Promise<string> => {
        const lowerContent = content.toLowerCase();
        let apiContext = '';

        // Check which APIs are relevant based on the content
        for (const [key, config] of Object.entries(apiConfigs)) {
            if (lowerContent.includes(config.description)) {
                const apiData = await fetchDataFromAPI(config);
                apiContext += `\n\nDữ liệu ${config.description}:\n${apiData}`;
            }
        }

        return apiContext;
    };

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        // Add user message
        const userMessage = addMessage({ role: 'user', content });

        // Add streaming message
        const streamingMessageId = crypto.randomUUID();
        const streamingMessage: Message = {
            role: 'streaming',
            content: '',
            timestamp: new Date(),
            id: streamingMessageId,
        };
        setMessages(prev => [...prev, streamingMessage]);

        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        const controller = new AbortController();
        abortController.current = controller;

        try {
            // Get relevant API data based on the message content
            const apiContext = await getRelevantAPIData(content);
            const apiKey = 'AIzaSyA_VcIwS-0GVkhTMPQ2KLCQy9o9ZixquPM';

            const systemPrompt = `Bạn là trợ lý ảo thông minh của Wishzy - nền tảng giáo dục trực tuyến hàng đầu Việt Nam.

HƯỚNG DẪN TRẢ LỜI:
1. Luôn thân thiện, chuyên nghiệp và hữu ích
2. Trả lời ngắn gọn, súc tích
3. Sử dụng dữ liệu được cung cấp để trả lời câu hỏi
4. Sử dụng tiếng Việt, trừ khi được yêu cầu khác
5. Nếu có dữ liệu từ hệ thống, hãy sử dụng nó để trả lời câu hỏi
6. Nếu không có thông tin, hãy nói rõ ràng và gợi ý các chủ đề liên quan

${apiContext ? `DỮ LIỆU HỆ THỐNG (chỉ sử dụng nếu liên quan đến câu hỏi):
${apiContext}\n\n` : ''}LỊCH SỬ TRÒ CHUYỆN (5 tin nhắn gần nhất):
${messages.slice(-5).map(m => `${m.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${m.content}`).join('\n')}

CÂU HỎI MỚI CỦA NGƯỜI DÙNG: ${content}

Hãy trả lời dựa trên thông tin được cung cấp và lịch sử trò chuyện. Nếu không có thông tin phù hợp, hãy hỏi rõ hơn về nhu cầu của người dùng.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: systemPrompt }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000,
                        }
                    }),
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Không thể kết nối đến dịch vụ AI');
            }

            const responseData = await response.json();
            const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (!responseText) {
                throw new Error('Không nhận được phản hồi từ AI');
            }

            // Update the streaming message with the final response
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === streamingMessageId
                        ? { ...msg, content: responseText, role: 'assistant' as const }
                        : msg
                )
            );
        } catch (err: any) {
            if (err.name === 'AbortError') {
                // Request was cancelled
                setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
            } else {
                console.error('Error:', err);
                setError(err.message || 'Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.');

                // Update the message with error
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === streamingMessageId
                            ? { ...msg, role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.' }
                            : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
            setIsTyping(false);
            if (abortController.current === controller) {
                abortController.current = null;
            }
        }
    }, [addMessage, isLoading]);

    const cancelRequest = useCallback(() => {
        if (abortController.current) {
            const controller = abortController.current;
            controller.abort();
            setIsLoading(false);
            setIsTyping(false);
            setMessages(prev => prev.filter(msg => msg.role !== 'streaming'));
            if (abortController.current === controller) {
                abortController.current = null;
            }
            setIsTyping(false);
            setMessages(prev => prev.filter(msg => msg.role !== 'streaming'));
            if (abortController.current === controller) {
                abortController.current = null;
            }
        }
    }, []);

    return {
        messages,
        isLoading,
        isTyping,
        error,
        sendMessage,
        clearMessages,
        cancelRequest,
    };
};
