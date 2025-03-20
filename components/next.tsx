'use client';
import { dir } from 'i18next';
import { languages } from '../i18n/settings';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (lang: 'en' | 'am') => {
    i18next.changeLanguage(lang); // Update i18next language
    router.push(`/${lang}${pathname.substring(3)}`); // Update the route with the new locale
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{t('adminNav.dashboard')}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('am')}>አማርኛ s</button>
    </div>
  );
}
