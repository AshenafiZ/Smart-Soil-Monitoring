'use client'
import { useTranslation } from 'next-i18next';

const AdminSidebar: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <nav>
      <ul>
        <li>{t('adminNav.dashboard')}</li>
        <li>{t('adminNav.userManagement.title')}</li>
        <ul>
          <li>{t('adminNav.userManagement.addUser')}</li>
          <li>{t('adminNav.userManagement.editUser')}</li>
          <li>{t('adminNav.userManagement.removeUser')}</li>
        </ul>
        <li>{t('adminNav.deviceManagement.title')}</li>
        <ul>
          <li>{t('adminNav.deviceManagement.addDevice')}</li>
          <li>{t('adminNav.deviceManagement.editDevice')}</li>
          <li>{t('adminNav.deviceManagement.removeDevice')}</li>
        </ul>
        <li>{t('adminNav.settings')}</li>
        <li>{t('adminNav.logout')}</li>
      </ul>
    </nav>
  );
};

export default AdminSidebar;
