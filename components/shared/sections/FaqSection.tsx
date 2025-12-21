"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFaqs } from "@/src/hooks/useFaqs";
import { Loader2 } from "lucide-react";

// Fallback data when API fails or is loading
const fallbackFaqData = [
  {
    id: "1",
    question: "Làm thế nào để đăng ký khóa học?",
    answer:
      "Bạn chỉ cần chọn khóa học mong muốn, nhấn nút 'Đăng ký ngay' và hoàn tất thanh toán. Sau đó, bạn sẽ nhận được email xác nhận và có thể truy cập khóa học ngay lập tức.",
  },
  {
    id: "2",
    question: "Tôi có thể học mọi lúc mọi nơi không?",
    answer:
      "Có, tất cả khóa học đều có thể học online 24/7. Bạn có thể học trên máy tính, điện thoại hoặc máy tính bảng bất cứ khi nào thuận tiện.",
  },
  {
    id: "3",
    question: "Khóa học có thời hạn truy cập không?",
    answer:
      "Sau khi đăng ký, bạn sẽ có quyền truy cập trọn đời vào khóa học, bao gồm tất cả các cập nhật và tài liệu bổ sung trong tương lai.",
  },
];

const FaqSection = () => {
  const { data: faqs, isLoading, isError } = useFaqs();

  // Use API data if available, otherwise use fallback
  const displayFaqs = faqs && faqs.length > 0 ? faqs : fallbackFaqData;

  return (
    <section id="faq" className="relative w-full overflow-hidden bg-background py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex flex-col items-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-sm font-medium shadow-sm mb-4">
            <span className="text-primary">✦</span>
            <span>FAQ</span>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Câu Hỏi Thường Gặp
            </h2>
            <p className="text-lg text-muted-foreground">
              Tìm câu trả lời cho các câu hỏi phổ biến về khóa học của chúng tôi.
            </p>
          </div>

          <div className="w-full mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Đang tải...</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {displayFaqs.map((faq, index) => (
                  <AccordionItem key={faq.id || index} value={`item-${faq.id || index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
