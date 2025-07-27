'use client'

import {NextIntlClientProvider} from 'next-intl';
import {useState, useEffect, createContext, useContext} from 'react';
import {detectLocale, setLocale} from '@/lib/locale';

interface LocaleContextType {
  locale: string;
  changeLocale: (newLocale: string) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface LocaleProviderProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export function LocaleProvider({children, messages, locale: initialLocale}: LocaleProviderProps) {
  const [locale, setCurrentLocale] = useState('en'); // 强制默认英文
  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() => {
    // 客户端检测语言偏好，但默认英文
    const detectedLocale = detectLocale();
    // 只有用户明确选择中文时才切换
    if (detectedLocale === 'zh' && localStorage.getItem('preferred-locale') === 'zh') {
      changeLocale(detectedLocale);
    } else {
      // 确保默认英文
      changeLocale('en');
    }
  }, []);

  const changeLocale = async (newLocale: string) => {
    try {
      // 动态加载新语言的翻译文件
      const newMessages = await import(`../messages/${newLocale}.json`);
      setCurrentMessages(newMessages.default);
      setCurrentLocale(newLocale);
      
      // 持久化语言偏好
      setLocale(newLocale);
    } catch (error) {
      console.error('Failed to change locale:', error);
    }
  };

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={currentMessages}
      onError={() => {}} // Gracefully handle translation errors
    >
      <LocaleContext.Provider value={{locale, changeLocale}}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}

export function useLocaleSwitch() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocaleSwitch must be used within LocaleProvider');
  }
  return context;
}