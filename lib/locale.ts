import { locales, defaultLocale } from '../next-intl.config.js';

export function detectLocale(): string {
  // 检查 localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale');
    if (stored && locales.includes(stored)) {
      return stored;
    }
  }

  // 检查 Cookie
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'locale' && locales.includes(value)) {
        return value;
      }
    }
  }

  // 检查浏览器语言
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang)) {
      return browserLang;
    }
  }

  return defaultLocale;
}

export function setLocale(locale: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    document.documentElement.lang = locale;
  }
}