'use client';

import { useTranslation } from 'next-i18next';

export function DynamicSidebar() {
  const { t } = useTranslation('common');

  const menu = t('adminNav', { returnObjects: true }) as Record<string, any>;

  return (
    <nav>
      <ul>
        <li>{menu.dashboard}</li>
        <li>
          <strong>{menu.userManagement.title}</strong>
          <ul>
            <li>{menu.userManagement.addUser}</li>
            <li>{menu.userManagement.editUser}</li>
            <li>{menu.userManagement.removeUser}</li>
          </ul>
        </li>
        <li>
          <strong>{menu.deviceManagement.title}</strong>
          <ul>
            <li>{menu.deviceManagement.addDevice}</li>
            <li>{menu.deviceManagement.editDevice}</li>
            <li>{menu.deviceManagement.removeDevice}</li>
          </ul>
        </li>
        <li>{menu.settings}</li>
        <li>{menu.logout}</li>
      </ul>
    </nav>
  );
}
