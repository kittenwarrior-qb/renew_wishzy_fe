'use client';

import { createTheme, MantineProvider as MantineProviderLib } from '@mantine/core';
import { notifications, Notifications } from '@mantine/notifications';
import { useEffect } from 'react';

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#f5f5f6', // 0
      '#e7e7e9', // 1
      '#cfcfd3', // 2
      '#b7b7bd', // 3
      '#9fa0a7', // 4
      '#878992', // 5
      '#3d3e45', // 6
      '#2b2c31', // 7
      '#1b1c20', // 8
      '#0f1013', // 9
    ],
  },
  components: {
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        // Use filled button with brand color (black-ish)
        variant: 'filled',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Tabs: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 为所有通知添加点击隐藏功能
    const setupNotificationClick = () => {
      // 查找所有通知元素
      const allNotifications = document.querySelectorAll('[class*="mantine-Notification-root"]');
      
      allNotifications.forEach((notificationElement) => {
        if ((notificationElement as any).__hasClickHandler) {
          return; // 已处理过
        }

        // 尝试获取通知 ID
        const notificationId = (notificationElement as HTMLElement).getAttribute('data-mantine-notification-id') ||
                             (notificationElement as HTMLElement).getAttribute('id') ||
                             (notificationElement as HTMLElement).querySelector('[data-mantine-notification-id]')?.getAttribute('data-mantine-notification-id');

        if (notificationId) {
          (notificationElement as HTMLElement).style.cursor = 'pointer';
          const hideHandler = (e: MouseEvent) => {
            // 如果点击的是关闭按钮，不处理（让默认行为处理）
            const target = e.target as HTMLElement;
            if (target.closest('[class*="mantine-Notification-closeButton"]')) {
              return;
            }
            e.stopPropagation();
            notifications.hide(notificationId);
          };
          notificationElement.addEventListener('click', hideHandler);
          (notificationElement as any).__hasClickHandler = true;
          (notificationElement as any).__hideHandler = hideHandler;
        }
      });
    };

    // 使用 MutationObserver 监听新通知
    const observer = new MutationObserver(() => {
      setupNotificationClick();
    });

    // 观察通知容器
    const checkContainer = () => {
      const container = document.querySelector('[class*="mantine-Notifications"]') ||
                       document.querySelector('[class*="mantine-NotificationsList"]');
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true,
        });
        setupNotificationClick();
      } else {
        // 如果容器还没创建，延迟重试
        setTimeout(checkContainer, 100);
      }
    };

    checkContainer();

    // 定期检查新通知（备用方案）
    const interval = setInterval(setupNotificationClick, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <MantineProviderLib theme={theme}>
      <Notifications
        zIndex={5000}
        position="top-right"
        autoClose={5000}
      />
      <style jsx global>{`
        [class*="mantine-Notification-root"] {
          cursor: pointer !important;
          transition: opacity 0.2s ease;
        }
        [class*="mantine-Notification-root"]:hover {
          opacity: 0.85;
        }
      `}</style>
      {children}
    </MantineProviderLib>
  );
}
