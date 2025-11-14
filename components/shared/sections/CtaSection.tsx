import { Button } from '@/components/ui/button';

const CtaSection = () => {
  return (
    <section className="relative bg-primary overflow-hidden py-20">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke="rgba(0,0,0,0.1)" 
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Sẵn Sàng Nâng Cao Năng Lực Của Bạn?
        </h2>
        
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          Khám phá hàng trăm khóa học chất lượng cao và bắt đầu hành trình học tập của bạn ngay hôm nay.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            variant="secondary"
            className="rounded-full px-7! h-[48px] text-[16px] transition-all hover:-translate-y-1 shadow-lg"
          >
            Bắt đầu học ngay
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
          
        </div>
        
        <p className="text-sm text-primary-foreground/60 mt-6">
          Học thử miễn phí • Chứng chỉ hoàn thành • Hỗ trợ 24/7
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
