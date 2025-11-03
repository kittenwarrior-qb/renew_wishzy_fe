'use client';

import { Tabs } from '@mantine/core';
import { useTranslations } from 'next-intl';

type AuthTabsProps = {
  activeTab: string | null;
  onTabChange: (value: string | null) => void;
  loginPanel: React.ReactNode;
  signupPanel: React.ReactNode;
};

export function AuthTabs({ activeTab, onTabChange, loginPanel, signupPanel }: AuthTabsProps) {
  const t = useTranslations('Auth');

  return (
    <Tabs value={activeTab} onChange={onTabChange}>
      <Tabs.List grow style={{ borderBottom: 'none' }}>
        <Tabs.Tab
          value="login"
          style={{
            borderTopLeftRadius: 'var(--mantine-radius-md)',
            borderTopRightRadius: 0,
            backgroundColor: activeTab === 'login' ? 'var(--mantine-color-gray-1)' : 'transparent',
          }}
        >
          {t('log_in_tab')}
        </Tabs.Tab>
        <Tabs.Tab
          value="signup"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 'var(--mantine-radius-md)',
            backgroundColor: activeTab === 'signup' ? 'var(--mantine-color-gray-1)' : 'transparent',
          }}
        >
          {t('sign_up_tab')}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="login" pt="lg">
        {loginPanel}
      </Tabs.Panel>

      <Tabs.Panel value="signup" pt="lg">
        {signupPanel}
      </Tabs.Panel>
    </Tabs>
  );
}
