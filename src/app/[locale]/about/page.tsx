"use client";

import { Phone, BookOpen, Users, Award, Clock, GraduationCap, FileText, Headset, Check, ChevronRight, Layers, BarChart, Shield, Globe, Zap, Bookmark, MessageSquare, Video, FileText as FileTextIcon, Code, PenTool, Layout, Lock, BarChart2, Settings, Users as UsersIcon, CreditCard, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, User, Search, ShoppingCart, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TestimonialSection } from '@/components/testimonial/TestimonialSection';
import Link from 'next/link';

export default function AboutPage() {
    const stats = [
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: '10,000+',
            description: 'Khóa học',
            color: 'bg-primary/10 text-primary'
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: '1,000,000+',
            description: 'Học viên',
            color: 'bg-secondary/10 text-secondary-foreground'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: '500+',
            description: 'Giảng viên',
            color: 'bg-accent/10 text-accent-foreground'
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: '24/7',
            description: 'Hỗ trợ',
            color: 'bg-destructive/10 text-destructive-foreground'
        }
    ];

    const features = [
        {
            icon: <Layout className="w-6 h-6 text-primary" />,
            title: 'Giao diện hiện đại',
            description: 'Thiết kế tối ưu trải nghiệm người dùng trên mọi thiết bị'
        },
        {
            icon: <Shield className="w-6 h-6 text-primary" />,
            title: 'Bảo mật cao',
            description: 'Đảm bảo an toàn thông tin người dùng với công nghệ mã hóa tiên tiến'
        },
        {
            icon: <BarChart2 className="w-6 h-6 text-primary" />,
            title: 'Báo cáo chi tiết',
            description: 'Theo dõi tiến độ học tập với các báo cáo trực quan'
        },
        {
            icon: <Settings className="w-6 h-6 text-primary" />,
            title: 'Tùy chỉnh linh hoạt',
            description: 'Dễ dàng tùy chỉnh giao diện và tính năng theo nhu cầu'
        },
        {
            icon: <UsersIcon className="w-6 h-6 text-primary" />,
            title: 'Hỗ trợ đa người dùng',
            description: 'Phân quyền chi tiết cho quản trị viên, giảng viên và học viên'
        },
        {
            icon: <CreditCard className="w-6 h-6 text-primary" />,
            title: 'Thanh toán đa kênh',
            description: 'Tích hợp nhiều phương thức thanh toán phổ biến'
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] max-h-[600px] bg-background">
                <Image
                    src="/images/bg.png"
                    alt="Wishzy Education"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60 z-10" />
                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Về chúng tôi</h1>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                            Wishzy
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8">
                            là nền tảng giáo dục trực tuyến hàng đầu, kết nối người học với những khóa học chất lượng từ các giảng viên tâm huyết.
                        </p>
                    </div>
                </div>
            </section>

            {/* About Wishzy Section */}
            <section id="about-wishzy" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Về Chúng Tôi</span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                                Wishzy - Hành Trình Kiến Tạo Tương Lai
                            </h2>
                            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                Nền tảng giáo dục trực tuyến hàng đầu Việt Nam với hơn 1 triệu học viên tin dùng
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 mb-16">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Sứ Mệnh Của Chúng Tôi</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Wishzy ra đời với sứ mệnh xóa bỏ mọi rào cản trong giáo dục, mang đến cơ hội học tập chất lượng cao cho mọi người dân Việt Nam, bất kể họ đang ở đâu và có điều kiện kinh tế như thế nào.
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    Chúng tôi tin rằng giáo dục chính là chìa khóa mở ra tương lai tươi sáng, và mỗi người đều xứng đáng có cơ hội phát triển bản thân thông qua việc học tập suốt đời.
                                </p>


                                <div className="space-y-8 mb-16 max-w-3xl mx-auto">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-blue-600 mr-4 mt-1">
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chất Lượng Hàng Đầu</h3>
                                            <p className="text-muted-foreground text-sm">Đội ngũ giảng viên chuyên nghiệp, giáo trình được biên soạn kỹ lưỡng và cập nhật liên tục</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-green-50 text-green-600 mr-4 mt-1">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Cộng Đồng Học Tập</h3>
                                            <p className="text-muted-foreground text-sm">Kết nối với hàng triệu học viên và giảng viên trên khắp mọi miền đất nước</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-50 text-purple-600 mr-4 mt-1">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Học Mọi Lúc Mọi Nơi</h3>
                                            <p className="text-muted-foreground text-sm">Truy cập khóa học mọi lúc, mọi nơi trên mọi thiết bị</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                                    <Image
                                        src="/images/about-education.jpg"
                                        alt="Học tập cùng Wishzy"
                                        width={600}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tầm Nhìn Chiến Lược</h3>
                                <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
                                <p className="text-muted-foreground max-w-3xl mx-auto">
                                    Đến năm 2030, Wishzy phấn đấu trở thành nền tảng giáo dục trực tuyến hàng đầu Đông Nam Á, góp phần nâng cao chất lượng nguồn nhân lực và thúc đẩy sự phát triển bền vững của xã hội.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-lg mb-4 text-gray-900 flex items-center">
                                        <Check className="w-5 h-5 text-green-500 mr-2" />
                                        Giá Trị Cốt Lõi
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Tập trung vào chất lượng đào tạo</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Đổi mới sáng tạo không ngừng</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Hướng tới lợi ích cộng đồng</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-4 text-gray-900 flex items-center">
                                        <Check className="w-5 h-5 text-green-500 mr-2" />
                                        Cam Kết
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Hoàn tiền 100% nếu không hài lòng</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Hỗ trợ 24/7 mọi lúc, mọi nơi</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">Bảo mật thông tin khách hàng tuyệt đối</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Khám phá những tính năng ưu việt giúp nâng cao trải nghiệm học tập và giảng dạy
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-10 md:py-14 bg-gradient-to-b from-white to-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 md:mb-10">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-2">Quy trình học tập</span>
                        <h2 className="text-xl md:text-2xl font-bold mb-2">Học tập hiệu quả cùng Wishzy</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                            Hành trình chinh phục kiến thức của bạn bắt đầu từ đây với 8 bước đơn giản
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting line - only show on larger screens */}
                        <div className="hidden xl:block absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent w-5/6 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
                            {[
                                {
                                    number: '01',
                                    icon: <User className="w-6 h-6" />,
                                    title: 'Đăng ký tài khoản',
                                    description: 'Tạo tài khoản dễ dàng bằng email, số điện thoại hoặc tài khoản mạng xã hội chỉ trong 30 giây',
                                    color: 'bg-blue-100 text-blue-600',
                                    delay: 0.1,
                                    tip: 'Miễn phí đăng ký'
                                },
                                {
                                    number: '02',
                                    icon: <Search className="w-6 h-6" />,
                                    title: 'Khám phá khóa học',
                                    description: 'Hơn 10,000+ khóa học đa dạng từ cơ bản đến nâng cao với đầy đủ các lĩnh vực',
                                    color: 'bg-purple-100 text-purple-600',
                                    delay: 0.2,
                                    tip: 'Đa dạng lựa chọn'
                                },
                                {
                                    number: '03',
                                    icon: <BookOpen className="w-6 h-6" />,
                                    title: 'Học thử miễn phí',
                                    description: 'Xem trước các bài học miễn phí để đánh giá chất lượng trước khi quyết định đăng ký',
                                    color: 'bg-green-100 text-green-600',
                                    delay: 0.3,
                                    tip: 'Học thử 3 bài'
                                },
                                {
                                    number: '04',
                                    icon: <ShoppingCart className="w-6 h-6" />,
                                    title: 'Thanh toán an toàn',
                                    description: 'Đa dạng hình thức thanh toán: chuyển khoản, ví điện tử, thẻ ngân hàng và trả góp 0%',
                                    color: 'bg-yellow-100 text-yellow-600',
                                    delay: 0.4,
                                    tip: 'Bảo mật tuyệt đối'
                                },
                                {
                                    number: '05',
                                    icon: <Play className="w-6 h-6" />,
                                    title: 'Học mọi lúc mọi nơi',
                                    description: 'Truy cập khóa học mọi lúc, mọi nơi trên điện thoại, máy tính bảng hoặc máy tính',
                                    color: 'bg-orange-100 text-orange-600',
                                    delay: 0.5,
                                    tip: '24/7 hỗ trợ'
                                },
                                {
                                    number: '06',
                                    icon: <MessageSquare className="w-6 h-6" />,
                                    title: 'Tương tác với giảng viên',
                                    description: 'Đặt câu hỏi, thảo luận và nhận phản hồi trực tiếp từ giảng viên chuyên nghiệp',
                                    color: 'bg-pink-100 text-pink-600',
                                    delay: 0.6,
                                    tip: 'Hỗ trợ 1:1'
                                },
                                {
                                    number: '07',
                                    icon: <Code className="w-6 h-6" />,
                                    title: 'Thực hành ngay',
                                    description: 'Làm bài tập thực hành, dự án thực tế và nhận đánh giá chi tiết',
                                    color: 'bg-indigo-100 text-indigo-600',
                                    delay: 0.7,
                                    tip: 'Học đi đôi với hành'
                                },
                                {
                                    number: '08',
                                    icon: <Award className="w-6 h-6" />,
                                    title: 'Nhận chứng chỉ',
                                    description: 'Nhận chứng chỉ xác nhận hoàn thành khóa học có giá trị toàn quốc',
                                    color: 'bg-red-100 text-red-600',
                                    delay: 0.8,
                                    tip: 'Có giá trị toàn quốc'
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="group bg-white p-4 rounded-lg shadow-sm border border-border hover:shadow-md transition-all duration-200 text-center relative overflow-hidden h-full flex flex-col"
                                    whileHover={{ y: -2, boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.03)' }}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.2,
                                        delay: step.delay,
                                        type: 'tween',
                                        ease: 'easeOut'
                                    }}
                                >
                                    {step.tip && (
                                        <span className="absolute top-3 right-2 bg-primary text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                            {step.tip}
                                        </span>
                                    )}
                                    <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-2`}>
                                        {step.number}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto -mt-8 mb-2 border border-gray-100">
                                        <span className={`${step.color.replace('bg-', 'text-').split(' ')[0]} text-base`}>
                                            {step.icon}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold mb-1.5 text-gray-800 group-hover:text-primary transition-colors duration-150">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed mb-1 flex-grow">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <Link href={'/search'}>
                                <Button size="sm" className="px-5 py-2.5 text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-sm hover:shadow transition-all">
                                    Bắt đầu học ngay
                                    <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </Link>

                            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs">
                                {[
                                    { icon: <Shield className="w-3.5 h-3.5" />, text: 'Bảo mật' },
                                    { icon: <Clock className="w-3.5 h-3.5" />, text: 'Học mọi lúc' },
                                    { icon: <Users className="w-3.5 h-3.5" />, text: 'Hỗ trợ 24/7' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center text-muted-foreground">
                                        <span className="text-primary mr-1">{item.icon}</span>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-card p-6 rounded-lg border border-border text-center">
                                <div className={`w-14 h-14 mx-auto ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                                    {stat.icon}
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.title}</div>
                                <div className="text-sm text-muted-foreground">{stat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-background">
                <div className="bg-muted/30 p-6 rounded-2xl">
                    <TestimonialSection />
                </div>
            </section>

            {/* Learning Features Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Tính năng học tập nổi bật
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Khám phá những tính năng ưu việt giúp nâng cao trải nghiệm học tập của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Video className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Bài giảng video chất lượng cao</h3>
                            <p className="text-muted-foreground">Học mọi lúc, mọi nơi với hệ thống bài giảng video được ghi hình chuyên nghiệp, rõ nét và dễ hiểu.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <FileTextIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tài liệu học tập đa dạng</h3>
                            <p className="text-muted-foreground">Kho tài liệu phong phú, cập nhật liên tục, hỗ trợ tối đa cho quá trình tự học của học viên.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tương tác trực tiếp với giảng viên</h3>
                            <p className="text-muted-foreground">Đặt câu hỏi và nhận phản hồi nhanh chóng từ đội ngũ giảng viên giàu kinh nghiệm.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Code className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Thực hành ngay trên nền tảng</h3>
                            <p className="text-muted-foreground">Hệ thống bài tập thực hành trực tuyến giúp củng cố kiến thức ngay sau mỗi bài học.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Theo dõi tiến độ học tập</h3>
                            <p className="text-muted-foreground">Hệ thống báo cáo chi tiết giúp bạn nắm rõ tiến độ và kết quả học tập của mình.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Cộng đồng học tập sôi động</h3>
                            <p className="text-muted-foreground">Kết nối và trao đổi kiến thức với cộng đồng học viên trên toàn quốc.</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href={'/search'}>
                            <Button size="lg" className="px-8 py-6 text-base">
                                Khám phá tất cả khóa học
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto bg-card p-8 md:p-12 rounded-2xl border border-border">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Bạn muốn trở thành giảng viên?</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Đăng ký ngay để trở thành giảng viên và chia sẻ kiến thức của bạn với hàng ngàn học viên
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={'/profile?tab=profile'}>
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6"
                                >
                                    Đăng ký giảng dạy ngay
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-foreground/20 hover:bg-foreground/5 px-8 py-6"
                            >
                                Tìm hiểu thêm
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-card rounded-xl border border-border overflow-hidden">
                        <div className="md:flex">
                            <div className="md:w-1/2 bg-primary/5 p-8 md:p-12">
                                <h2 className="text-2xl font-bold text-foreground mb-4">Liên hệ với chúng tôi</h2>
                                <p className="text-muted-foreground mb-8">
                                    Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground">Hotline</h4>
                                            <a href="tel:0372002972" className="text-muted-foreground hover:text-primary">0372 002 972</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground">Email</h4>
                                            <a href="mailto:info@wishzy.edu.vn" className="text-muted-foreground hover:text-primary">info@wishzy.edu.vn</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground">Địa chỉ</h4>
                                            <p className="text-muted-foreground">Số 1 Đại Cồ Việt, Hà Nội</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-1/2 bg-card p-6 md:p-8">
                                <h3 className="text-xl font-bold text-foreground mb-4">Gửi tin nhắn cho chúng tôi</h3>
                                <form className="space-y-3">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Họ và tên</label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Nhập địa chỉ email"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Nội dung</label>
                                        <textarea
                                            id="message"
                                            rows={3}
                                            className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="Nhập nội dung tin nhắn"
                                        ></textarea>
                                    </div>
                                    <Button type="submit" size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                        Gửi tin nhắn
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-6 left-6 z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button asChild size="lg" className="rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                    <a href="tel:0372002972" className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        <span>0372 002 972</span>
                    </a>
                </Button>
            </motion.div>
        </main >
    );
}