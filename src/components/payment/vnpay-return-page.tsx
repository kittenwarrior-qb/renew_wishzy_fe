'use client';

import { Button, Card, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter as useI18nRouter } from '@/libs/I18nNavigation';
import { useCartStore } from '@/stores/useCartStore';
import { useVerifyPayment } from './usePayment';

export function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const i18nRouter = useI18nRouter();

  const params = useMemo(
    () => new URLSearchParams(searchParams?.toString() || ''),
    [searchParams],
  );

  const { data: result, isLoading: loading, error: queryError } = useVerifyPayment(params);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (
      !clearedRef.current
      && result?.isSuccess
      && result?.vnp_ResponseCode === '00'
    ) {
      try {
        const raw = localStorage.getItem('checkout_items');
        const items: Array<{ id?: string; _id?: string; [key: string]: unknown }> = raw ? JSON.parse(raw) : [];
        const newIds = Array.isArray(items)
          ? items.map(i => (i.id || i._id || '')).filter(Boolean)
          : [];

        const ownedRaw = localStorage.getItem('owned_courses');
        const ownedSet = new Set<string>(
          ownedRaw ? JSON.parse(ownedRaw) : [],
        );
        newIds.forEach(id => ownedSet.add(id));
        localStorage.setItem(
          'owned_courses',
          JSON.stringify(Array.from(ownedSet)),
        );

        const current = useCartStore.getState().items || [];
        const remaining = current.filter(it => !newIds.includes(it.course.id));
        if (remaining.length !== current.length) {
          useCartStore.getState().clearCart();
          remaining.forEach((item) => {
            useCartStore.getState().addItem(item.course);
          });
        }
      } catch (e) {
        console.error('Error processing payment success:', e);
      }

      clearedRef.current = true;
    }
  }, [result]);

  const onGoMyCourses = () => i18nRouter.push('/my-courses');
  const onGoHome = () => i18nRouter.push('/');

  return (
    <Container size="sm" py="xl" className="flex min-h-screen items-center justify-center">
      <Card shadow="md" padding="xl" radius="md" withBorder className="w-full">
        {loading && (
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Đang xử lý...</Text>
          </Stack>
        )}

        {!loading && queryError && (
          <Stack align="center" gap="md">
            <IconX size={64} className="text-red-600" />
            <Title order={2} c="red">
              Xác thực thất bại
            </Title>
            <Text c="dimmed" ta="center">
              {queryError instanceof Error ? queryError.message : 'Có lỗi xảy ra'}
            </Text>
            <Button onClick={onGoHome} mt="md">
              Về trang chủ
            </Button>
          </Stack>
        )}

        {!loading && !queryError && result && (
          <>
            {result.isSuccess && result.vnp_ResponseCode === '00'
              ? (
                  <Stack align="center" gap="md">
                    <IconCheck size={64} className="text-green-600" />
                    <Title order={2} c="green">
                      Thanh toán thành công
                    </Title>
                    <Text c="dimmed" ta="center">
                      Bạn đã được ghi nhận thanh toán. Khóa học sẽ được mở khóa cho
                      tài khoản của bạn.
                    </Text>
                    <Group gap="md" mt="md">
                      <Button onClick={onGoMyCourses}>
                        Vào khóa học của tôi
                      </Button>
                      <Button variant="outline" onClick={onGoHome}>
                        Về trang chủ
                      </Button>
                    </Group>
                  </Stack>
                )
              : (
                  <Stack align="center" gap="md">
                    <IconX size={64} className="text-red-600" />
                    <Title order={2} c="red">
                      Thanh toán thất bại
                    </Title>
                    <Text c="dimmed" ta="center">
                      {result.message || 'VNPay trả về trạng thái thất bại.'}
                    </Text>
                    <Button onClick={onGoHome} mt="md">
                      Về trang chủ
                    </Button>
                  </Stack>
                )}
          </>
        )}
      </Card>
    </Container>
  );
}
