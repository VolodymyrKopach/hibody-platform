import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

interface UseLocalizationReturn {
  t: (key: string, options?: any) => string;
  changeLanguage: (language: string) => Promise<void>;
  currentLanguage: string;
  availableLanguages: string[];
  isRTL: boolean;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (date: Date) => string;
  getLanguageName: (code: string) => string;
}

const languageNames: Record<string, string> = {
  uk: 'Українська',
  en: 'English',
};

const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

export const useLocalization = (): UseLocalizationReturn => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      // Store language preference
      localStorage.setItem('i18nextLng', language);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  }, [i18n]);

  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(i18n.language, { ...defaultOptions, ...options }).format(date);
  }, [i18n.language]);

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  }, [i18n.language]);

  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }, [i18n.language]);

  const getLanguageName = useCallback((code: string): string => {
    return languageNames[code] || code;
  }, []);

  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language,
    availableLanguages: Array.isArray(i18n.options.supportedLngs) 
      ? i18n.options.supportedLngs.filter((lng: string) => lng !== 'cimode') 
      : ['uk', 'en'],
    isRTL: rtlLanguages.includes(i18n.language),
    formatDate,
    formatNumber,
    formatRelativeTime,
    getLanguageName,
  };
}; 