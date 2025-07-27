'use client'

import { useLocale } from 'next-intl';
import playerDataZh from '@/data/player.json';
import playerDataEn from '@/data/player-en.json';

/**
 * Returns localized data based on current language
 */
export function useLocalizedPlayerData() {
  const locale = useLocale();
  
  return locale === 'zh' ? playerDataZh : playerDataEn;
}

interface LocalizedTextProps {
  zh: string;
  en: string;
  className?: string;
}

/**
 * Component that displays corresponding text based on current language
 */
export function LocalizedText({ zh, en, className }: LocalizedTextProps) {
  const locale = useLocale();
  
  return (
    <span className={className}>
      {locale === 'zh' ? zh : en}
    </span>
  );
}

interface LocalizedContentProps {
  children: (data: any) => React.ReactNode;
}

/**
 * Higher-order component that provides localized data
 */
export function LocalizedContent({ children }: LocalizedContentProps) {
  const data = useLocalizedPlayerData();
  
  return <>{children(data)}</>;
}