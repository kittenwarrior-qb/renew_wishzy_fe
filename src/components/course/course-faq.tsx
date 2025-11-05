import { Accordion, Paper, Stack, Title } from '@mantine/core';

type FAQ = {
  question: string;
  answer: string;
};

type CourseFAQProps = {
  faqs?: FAQ[];
};

export function CourseFAQ({ faqs }: CourseFAQProps) {
  // Mock data if not provided
  const mockFaqs: FAQ[] = faqs ?? [
    {
      question: 'Tôi có thể học khóa học này ở đâu?',
      answer: 'Bạn có thể học khóa học này trực tuyến trên nền tảng của chúng tôi, mọi lúc mọi nơi miễn là có kết nối internet.',
    },
    {
      question: 'Thời gian hoàn thành khóa học là bao lâu?',
      answer: 'Bạn có thể học với tốc độ của riêng mình. Trung bình, học viên hoàn thành khóa học trong vòng 4-6 tuần.',
    },
    {
      question: 'Tôi có nhận được chứng chỉ sau khi hoàn thành không?',
      answer: 'Có, bạn sẽ nhận được chứng chỉ hoàn thành khóa học sau khi hoàn thành tất cả các bài học và bài tập.',
    },
    {
      question: 'Tôi có thể hỏi giảng viên nếu gặp khó khăn không?',
      answer: 'Tất nhiên! Bạn có thể đặt câu hỏi trong phần thảo luận và giảng viên sẽ trả lời trong vòng 24-48 giờ.',
    },
    {
      question: 'Khóa học có giới hạn thời gian truy cập không?',
      answer: 'Không, sau khi mua khóa học, bạn sẽ có quyền truy cập trọn đời vào tất cả nội dung.',
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Câu hỏi thường gặp</Title>
      <Paper p="md" withBorder>
        <Accordion variant="separated">
          {mockFaqs.map((faq, index) => (
            <Accordion.Item key={index} value={`faq-${index}`}>
              <Accordion.Control>{faq.question}</Accordion.Control>
              <Accordion.Panel>{faq.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Paper>
    </Stack>
  );
}
