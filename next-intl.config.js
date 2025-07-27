import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// 支持的语言列表
export const locales = ['zh', 'en'];
export const defaultLocale = 'zh';

export default getRequestConfig(async ({locale}) => {
  // 验证语言是否支持
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    onError: (error) => {
      // 开发环境显示警告，生产环境静默处理
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation missing:', error.message);
      }
    },
    getMessageFallback: ({namespace, key, error}) => {
      // 返回原始 key 作为后备
      return `${namespace}.${key}`;
    }
  };
});