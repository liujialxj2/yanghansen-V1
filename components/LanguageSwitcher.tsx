'use client'

import {useLocale} from 'next-intl';
import {useLocaleSwitch} from '@/components/LocaleProvider';
import {Button} from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const {changeLocale} = useLocaleSwitch();

  const handleLanguageSwitch = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    changeLocale(newLocale);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageSwitch}
      className="text-gray-700 hover:text-blazers-red transition-colors"
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </Button>
  );
}