'use client';

import React from 'react';
import { BookOpen, Video, Award, Users, BarChart, MessageSquare, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'Thư Viện Khóa Học Phong Phú',
    description: 'Hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu, cập nhật liên tục với nội dung mới nhất.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Video,
    title: 'Học Trực Tuyến Linh Hoạt',
    description: 'Video bài giảng HD, học mọi lúc mọi nơi trên mọi thiết bị. Tốc độ phát tùy chỉnh và phụ đề đầy đủ.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Award,
    title: 'Chứng Chỉ Hoàn Thành',
    description: 'Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học, nâng cao giá trị CV và cơ hội nghề nghiệp.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Cộng Đồng Học Tập',
    description: 'Kết nối với hàng triệu học viên, chia sẻ kinh nghiệm và cùng nhau phát triển trong môi trường học tập tích cực.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BarChart,
    title: 'Theo Dõi Tiến Độ',
    description: 'Hệ thống theo dõi tiến độ học tập chi tiết, thống kê thành tích và đề xuất lộ trình học tập phù hợp.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: MessageSquare,
    title: 'Hỗ Trợ Tương Tác',
    description: 'Hỏi đáp trực tiếp với giảng viên, tham gia thảo luận nhóm và nhận phản hồi chi tiết cho bài tập.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-sm font-medium shadow-sm mb-4">
            <span className="text-primary">✦</span>
            <span>Tính năng</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nền Tảng Học Tập Hiện Đại
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Tất cả những gì bạn cần để học tập hiệu quả và phát triển kỹ năng trong thời đại số.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="px-6">
                  <div className={`w-12 h-12 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
