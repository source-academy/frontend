import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { i18nLanguageCode, resources } from './locales';


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: i18nLanguageCode.ENGLISH,
    debug: true,
    resources,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;