'use client'

import { useLocale } from 'next-intl';

interface ChineseFilterProps {
  children: React.ReactNode;
}

/**
 * Strict Chinese filter - completely hides content containing Chinese in English mode
 */
export function ChineseFilter({ children }: ChineseFilterProps) {
  const locale = useLocale();
  
  // 在英文模式下，不渲染任何可能包含中文的内容
  if (locale === 'en') {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * English filter - completely hides content containing English in Chinese mode
 */
export function EnglishFilter({ children }: ChineseFilterProps) {
  const locale = useLocale();
  
  // 在中文模式下，不渲染任何英文专用内容
  if (locale === 'zh') {
    return null;
  }
  
  return <>{children}</>;
}