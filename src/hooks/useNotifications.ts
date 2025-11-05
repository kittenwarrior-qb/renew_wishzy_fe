import type { NotificationData } from '@mantine/notifications';
import { notifications, notificationsStore, useNotifications as useMantineNotifications } from '@mantine/notifications';

export type NotificationPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

export type NotificationOptions = {
  id?: string;
  position?: NotificationPosition;
  withCloseButton?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  autoClose?: number | boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'grape' | 'violet' | 'cyan' | 'pink' | 'orange' | 'teal' | 'lime' | 'indigo';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  [key: string]: unknown;
};

export type CustomNotificationsState = {
  notifications: NotificationData[];
  queue: NotificationData[];
};

export type UseNotificationsReturn = {
  show: (props: NotificationOptions) => string;
  hide: (id: string) => void;
  update: (id: string, props: Partial<NotificationOptions>) => void;
  updateState: (callback: (state: CustomNotificationsState) => CustomNotificationsState) => void;
  clean: () => void;
  cleanQueue: () => void;
};

export function useNotifications(): UseNotificationsReturn {
  const { notifications: currentNotifications, queue: currentQueue } = useMantineNotifications();

  return {
    show: (props: NotificationOptions): string => {
      const notificationData: NotificationData = {
        id: props.id || `notification-${Date.now()}-${Math.random()}`,
        position: props.position || 'top-right',
        withCloseButton: props.withCloseButton,
        onClose: props.onClose,
        onOpen: props.onOpen,
        autoClose: props.autoClose,
        title: props.title,
        message: props.message || props.title || '',
        color: props.color,
        icon: props.icon,
        className: props.className,
        style: props.style,
        loading: props.loading,
        ...props,
      };
      const notificationId = notifications.show({
        ...notificationData,
        onClose: () => {
          if (props.onClose) {
            props.onClose();
          }
        },
      });
      
      // 为所有通知添加点击隐藏功能（除非自定义了 onClick）
      if (typeof window !== 'undefined') {
        // 使用多个 setTimeout 确保 DOM 已完全渲染
        const tryAttachClick = (attempt = 0) => {
          if (attempt > 5) return; // 最多尝试 5 次
          
          // 尝试多种选择器找到通知元素
          const selectors = [
            `[data-mantine-notification-id="${notificationId}"]`,
            `[id="${notificationId}"]`,
            `[id*="${notificationId}"]`,
          ];
          
          let notificationElement: Element | null = null;
          for (const selector of selectors) {
            notificationElement = document.querySelector(selector);
            if (notificationElement) break;
          }
          
          // 如果找不到，通过类名查找
          if (!notificationElement) {
            const allNotifications = document.querySelectorAll('[class*="mantine-Notification-root"]');
            notificationElement = Array.from(allNotifications).find(
              (el) => {
                const id = (el as HTMLElement).getAttribute('data-mantine-notification-id') ||
                          (el as HTMLElement).getAttribute('id');
                return id === notificationId || id?.includes(notificationId);
              }
            ) || null;
          }
          
          if (notificationElement && !(notificationElement as any).__hasClickHandler) {
            (notificationElement as HTMLElement).style.cursor = 'pointer';
            const hideHandler = (e: MouseEvent) => {
              // 如果点击的是关闭按钮，不处理
              const target = e.target as HTMLElement;
              if (target.closest('[class*="mantine-Notification-closeButton"]')) {
                return;
              }
              e.stopPropagation();
              notifications.hide(notificationId);
            };
            
            if (props.onClick) {
              // 自定义 onClick
              notificationElement.addEventListener('click', props.onClick as (e: MouseEvent) => void);
            } else {
              // 默认点击隐藏
              notificationElement.addEventListener('click', hideHandler);
            }
            
            (notificationElement as any).__hasClickHandler = true;
            (notificationElement as any).__hideHandler = hideHandler;
          } else if (!notificationElement) {
            // 如果还没找到，延迟重试
            setTimeout(() => tryAttachClick(attempt + 1), 100);
          }
        };
        
        // 开始尝试附加点击处理
        setTimeout(() => tryAttachClick(), 50);
      }
      
      return notificationId;
    },

    hide: (id: string): void => {
      notifications.hide(id);
    },

    update: (id: string, props: Partial<NotificationOptions>): void => {
      const notificationData: Partial<NotificationData> = {
        id,
        ...(props.position !== undefined && { position: props.position }),
        ...(props.withCloseButton !== undefined && { withCloseButton: props.withCloseButton }),
        ...(props.onClose !== undefined && { onClose: props.onClose }),
        ...(props.onOpen !== undefined && { onOpen: props.onOpen }),
        ...(props.autoClose !== undefined && { autoClose: props.autoClose }),
        ...(props.title !== undefined && { title: props.title }),
        ...(props.message !== undefined && { message: props.message }),
        ...(props.color !== undefined && { color: props.color }),
        ...(props.icon !== undefined && { icon: props.icon }),
        ...(props.className !== undefined && { className: props.className }),
        ...(props.style !== undefined && { style: props.style }),
        ...(props.loading !== undefined && { loading: props.loading }),
        ...props,
      };
      notifications.update(notificationData as NotificationData);
    },

    updateState: (callback: (state: CustomNotificationsState) => CustomNotificationsState): void => {
      const currentState: CustomNotificationsState = {
        notifications: currentNotifications,
        queue: currentQueue,
      };
      const newState = callback(currentState);

      notifications.updateState(notificationsStore, () => {
        return [...newState.notifications, ...newState.queue];
      });
    },

    clean: (): void => {
      notifications.clean();
    },

    cleanQueue: (): void => {
      notifications.cleanQueue();
    },
  };
}
