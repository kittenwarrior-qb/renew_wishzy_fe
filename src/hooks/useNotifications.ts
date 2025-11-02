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
      return notifications.show(notificationData);
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
