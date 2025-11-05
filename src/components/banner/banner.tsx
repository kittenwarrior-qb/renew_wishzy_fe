'use client';

import { Box, Button, Container, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';

type BannerProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
};

export function Banner({
  title,
  description,
  buttonText,
  buttonLink = '/course',
  backgroundImage,
}: BannerProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const t = useTranslations('Banner');

  const defaultTitle = title || t('title');
  const defaultDescription = description || t('description');
  const defaultButtonText = buttonText || t('buttonText');

  return (
    <Box
      style={{
        position: 'relative',
        background: isDark
          ? 'linear-gradient(135deg, #1a1b1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 0',
        overflow: 'hidden',
      }}
    >
      {backgroundImage && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 0,
          }}
        />
      )}
      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack gap="lg" align="center" ta="center">
          <Title
            order={1}
            size="3.5rem"
            fw={800}
            style={{
              lineHeight: 1.2,
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {defaultTitle}
          </Title>
          <Text
            size="xl"
            maw={600}
            style={{
              opacity: 0.95,
              lineHeight: 1.6,
            }}
          >
            {defaultDescription}
          </Text>
          <Button
            component={Link}
            href={buttonLink}
            size="lg"
            variant="white"
            color="violet"
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {defaultButtonText}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
