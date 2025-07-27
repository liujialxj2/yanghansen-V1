import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { filterChineseContent } from '@/lib/data-filter';

/**
 * 安全数据Hook - 确保英文模式下不显示中文内容
 */
export function useSafeData<T>(data: T): T {
  const locale = useLocale();
  
  return useMemo(() => {
    return filterChineseContent(data, locale) as T;
  }, [data, locale]);
}

/**
 * 安全文本Hook - 单个文本的安全处理
 */
export function useSafeText(text: string, fallback: string = '[EN]'): string {
  const locale = useLocale();
  
  return useMemo(() => {
    if (locale === 'zh') {
      return text;
    }
    
    const filtered = filterChineseContent(text, locale);
    return typeof filtered === 'string' ? filtered : fallback;
  }, [text, locale, fallback]);
}