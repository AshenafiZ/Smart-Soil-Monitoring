'use client';

import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation('common');
  const menu = t('adminNav', { returnObjects: true }) as Record<string, any>;

  return (
    <nav className="p-4 border-r w-64 bg-gray-100 min-h-screen">
      <ul className="space-y-2">
        <li className="font-bold">{t.dashboard}</li>
        <li>
          <strong>{menu.userManagement.title}</strong>
          <ul className="pl-4 space-y-1">
            <li>{menu.userManagement.addUser}</li>
            <li>{menu.userManagement.editUser}</li>
            <li>{menu.userManagement.removeUser}</li>
          </ul>
        </li>
        <li>
          <strong>{menu.deviceManagement.title}</strong>
          <ul className="pl-4 space-y-1">
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
};

export default Sidebar;
