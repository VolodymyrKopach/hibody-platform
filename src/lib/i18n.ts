import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`../locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: 'uk',
    supportedLngs: ['uk', 'en'],
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Namespace options
    ns: ['common', 'auth', 'chat', 'account', 'lessons', 'slides'],
    defaultNS: 'common',

    // Loading options
    load: 'languageOnly',
    preload: ['uk', 'en'],

    // React options
    react: {
      useSuspense: true,
    },

    // Interpolation options
    interpolation: {
      escapeValue: false,
    },

    // Debug mode disabled to prevent console spam
    debug: false,
  });

export default i18n; 