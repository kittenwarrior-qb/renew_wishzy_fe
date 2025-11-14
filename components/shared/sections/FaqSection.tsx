"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "Làm thế nào để đăng ký khóa học?",
    answer:
      "Bạn chỉ cần chọn khóa học mong muốn, nhấn nút 'Đăng ký ngay' và hoàn tất thanh toán. Sau đó, bạn sẽ nhận được email xác nhận và có thể truy cập khóa học ngay lập tức.",
  },
  {
    question: "Tôi có thể học mọi lúc mọi nơi không?",
    answer:
      "Có, tất cả khóa học đều có thể học online 24/7. Bạn có thể học trên máy tính, điện thoại hoặc máy tính bảng bất cứ khi nào thuận tiện.",
  },
  {
    question: "Khóa học có thời hạn truy cập không?",
    answer:
      "Sau khi đăng ký, bạn sẽ có quyền truy cập trọn đời vào khóa học, bao gồm tất cả các cập nhật và tài liệu bổ sung trong tương lai.",
  },
  {
    question: "Tôi có nhận được chứng chỉ sau khi hoàn thành khóa học không?",
    answer:
      "Có, sau khi hoàn thành khóa học và vượt qua bài kiểm tra cuối khóa, bạn sẽ nhận được chứng chỉ hoàn thành có thể chia sẻ trên LinkedIn và CV.",
  },
  {
    question: "Nếu tôi không hài lòng với khóa học thì sao?",
    answer:
      "Chúng tôi cung cấp chính sách hoàn tiền 100% trong vòng 30 ngày đầu tiên nếu bạn không hài lòng với khóa học, không cần lý do.",
  },
  {
    question: "Tôi cần kiến thức nền tảng gì để bắt đầu?",
    answer:
      "Mỗi khóa học có yêu cầu kiến thức khác nhau. Bạn có thể xem phần 'Yêu cầu' trong trang chi tiết khóa học để biết thêm thông tin.",
  },
  {
    question: "Có hỗ trợ khi gặp khó khăn trong quá trình học không?",
    answer:
      "Có, bạn có thể đặt câu hỏi trực tiếp trong phần thảo luận của khóa học hoặc liên hệ với đội ngũ hỗ trợ qua email. Giảng viên và cộng đồng học viên sẽ giúp đỡ bạn.",
  },
  {
    question: "Tôi có thể thanh toán bằng cách nào?",
    answer:
      "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ, ví điện tử (Momo, ZaloPay), chuyển khoản ngân hàng và các phương thức thanh toán phổ biến khác.",
  },
];

const FaqSection = () => {
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
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
