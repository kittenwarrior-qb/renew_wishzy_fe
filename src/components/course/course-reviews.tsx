import { Avatar, Group, Paper, Rating, Stack, Text, Title } from '@mantine/core';

type Review = {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type CourseReviewsProps = {
  reviews?: Review[];
};

export function CourseReviews({ reviews }: CourseReviewsProps) {
  // Mock data if not provided
  const mockReviews: Review[] = reviews ?? [
    {
      id: '1',
      userName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Khóa học rất chất lượng, giảng viên nhiệt tình. Nội dung dễ hiểu và thực tế.',
      createdAt: '2024-10-15',
    },
    {
      id: '2',
      userName: 'Trần Thị B',
      rating: 4,
      comment: 'Nội dung hay, tuy nhiên có một vài phần hơi khó. Nhưng overall rất tốt!',
      createdAt: '2024-10-20',
    },
    {
      id: '3',
      userName: 'Lê Văn C',
      rating: 5,
      comment: 'Đáng đồng tiền bát gạo. Recommend cho mọi người!',
      createdAt: '2024-10-25',
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Đánh giá từ học viên</Title>
      {mockReviews.map(review => (
        <Paper key={review.id} p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Group gap="sm">
                <Avatar color="blue" radius="xl">
                  {review.userName.charAt(0)}
                </Avatar>
                <Stack gap={0}>
                  <Text fw={500} size="sm">
                    {review.userName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </Stack>
              </Group>
              <Rating value={review.rating} readOnly />
            </Group>
            <Text size="sm">{review.comment}</Text>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
