'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Testimonial = {
    id: number;
    content: string;
    author: string;
    role: string;
    avatar: string;
    company: string;
};

export function TestimonialSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for forward, -1 for backward
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            content:
                '"Tôi đã sử dụng dịch vụ của Wishzy được hơn 1 năm nay và thực sự ấn tượng với chất lượng đào tạo. Đội ngũ giảng viên nhiệt tình, chuyên môn cao, luôn cập nhật kiến thức mới nhất. Đặc biệt là hệ thống bài giảng được thiết kế rất khoa học, dễ hiểu."',
            author: 'Nguyễn Văn A',
            role: 'Giám đốc đào tạo',
            avatar: '/images/avatars/avatar-1.jpg',
            company: 'Công ty Cổ phần Giáo dục ABC'
        },
        {
            id: 2,
            content:
                '"Nhờ có khóa học lập trình tại Wishzy mà tôi đã có thể chuyển đổi nghề nghiệp thành công. Giáo trình bài bản, thực tế, mentor hỗ trợ nhiệt tình. Đặc biệt là chế độ học trực tuyến rất linh hoạt, phù hợp với người đi làm như tôi."',
            author: 'Trần Thị B',
            role: 'Lập trình viên Frontend',
            avatar: '/images/avatars/avatar-2.jpg',
            company: 'Công ty Công nghệ XYZ'
        },
        {
            id: 3,
            content:
                '"Tôi đã tham gia nhiều khóa học trực tuyến nhưng chưa thấy nền tảng nào chuyên nghiệp và hiệu quả như Wishzy. Hệ thống bài tập thực hành phong phú, đội ngũ hỗ trợ nhiệt tình, luôn đồng hành cùng học viên."',
            author: 'Lê Văn C',
            role: 'Trưởng phòng Đào tạo',
            avatar: '/images/avatars/avatar-3.jpg',
            company: 'Trung tâm Đào tạo Công nghệ'
        }
    ];

    // Auto-advance testimonials
    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        // Update height when currentIndex changes
        const updateHeight = () => {
            const element = document.querySelector('.testimonial-content');
            if (element) {
                setHeight(element.scrollHeight);
            }
        };

        const timeoutId = setTimeout(updateHeight, 50); // Small delay to ensure DOM is updated

        return () => {
            clearInterval(timer);
            clearTimeout(timeoutId);
        };
    }, [isAutoPlaying, testimonials.length, currentIndex]);

    const goToNext = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const goToPrev = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            right: 0
        }),
        center: {
            x: 0,
            opacity: 1,
            position: 'relative',
            width: '100%',
            top: 0,
            left: 0,
            right: 0,
            transition: {
                x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] } as const,
                opacity: { duration: 0.3 }
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            right: 0,
            transition: {
                x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] } as const,
                opacity: { duration: 0.3 }
            }
        })
    };

    // Calculate the height of the current testimonial
    const [height, setHeight] = useState(400); // Default height

    return (
        <div
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Học viên nói gì về chúng tôi</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Hàng ngàn học viên đã tin tưởng và đồng hành cùng chúng tôi trên con đường chinh phục kiến thức
                </p>
            </div>

            <div
                className="relative"
                style={{ minHeight: `${height}px` }}
            >
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 w-full"
                        onAnimationStart={() => {
                            // Update height when animation starts
                            const element = document.querySelector('.testimonial-content');
                            if (element) {
                                setHeight(element.scrollHeight);
                            }
                        }}
                    >
                        <div className="md:flex testimonial-content">
                            <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-gray-200 mb-6 overflow-hidden">
                                    <Image
                                        src={testimonials[currentIndex].avatar}
                                        alt={testimonials[currentIndex].author}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">{testimonials[currentIndex].author}</h3>
                                <p className="text-primary font-medium mb-2">{testimonials[currentIndex].role}</p>
                                <p className="text-sm text-gray-500 text-center">{testimonials[currentIndex].company}</p>

                                <div className="mt-6 flex space-x-4">
                                    <a href="#" className="text-sm text-primary hover:underline flex items-center">
                                        <span>Xem thêm</span>
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </a>
                                    <a href="#" className="text-sm text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md transition-colors">
                                        Xem website
                                    </a>
                                </div>
                            </div>

                            <div className="md:w-2/3 p-8 md:p-12">
                                <div className="relative">
                                    <svg
                                        className="w-12 h-12 text-gray-200 absolute -top-2 -left-2"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                    <p className="text-lg text-gray-700 leading-relaxed pl-8">
                                        {testimonials[currentIndex].content}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {testimonials.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToSlide(index)}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
                                                aria-label={`Xem đánh giá ${index + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={goToPrev}
                                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            aria-label="Đánh giá trước"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={goToNext}
                                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            aria-label="Đánh giá tiếp theo"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
