'use client'

import { useLocale } from 'next-intl';

interface ConditionalContentProps {
  zh: React.ReactNode;
  en: React.ReactNode;
}

/**
 * Component that renders content conditionally based on current locale
 * Ensures no Chinese characters are shown in English mode and vice versa
 */
export function ConditionalContent({ zh, en }: ConditionalContentProps) {
  const locale = useLocale();
  
  return <>{locale === 'zh' ? zh : en}</>;
}