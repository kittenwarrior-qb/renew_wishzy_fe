"use client";

import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      content: 'support@wishzy.vn',
      description: 'Gửi email cho chúng tôi bất cứ lúc nào'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Điện thoại',
      content: '1900 1234',
      description: 'Hotline hỗ trợ 24/7'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Địa chỉ',
      content: 'Hà Nội, Việt Nam',
      description: 'Trụ sở chính'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Giờ làm việc',
      content: '8:00 - 22:00',
      description: 'Thứ 2 - Chủ nhật'
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ Wishzy luôn sẵn sàng lắng nghe và giúp đỡ bạn.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                <p className="text-primary font-medium mb-1">{info.content}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gửi tin nhắn</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên</label>
                    <Input
                      placeholder="Nhập họ và tên"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Chủ đề</label>
                  <Input
                    placeholder="Nhập chủ đề"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung</label>
                  <Textarea
                    placeholder="Nhập nội dung tin nhắn..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Map / Additional Info */}
            <div className="space-y-6">
              <div className="bg-card p-8 rounded-xl border border-border h-full">
                <h2 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Làm sao để đăng ký khóa học?</h4>
                    <p className="text-sm text-muted-foreground">Bạn chỉ cần tạo tài khoản, chọn khóa học và thanh toán để bắt đầu học ngay.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Tôi có thể hoàn tiền không?</h4>
                    <p className="text-sm text-muted-foreground">Có, chúng tôi hỗ trợ hoàn tiền 100% trong vòng 7 ngày nếu bạn không hài lòng.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Khóa học có thời hạn không?</h4>
                    <p className="text-sm text-muted-foreground">Không, bạn có quyền truy cập vĩnh viễn sau khi mua khóa học.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Làm sao để liên hệ giảng viên?</h4>
                    <p className="text-sm text-muted-foreground">Bạn có thể đặt câu hỏi trực tiếp trong phần bình luận của mỗi bài học.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
