import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { InternationalLanguage } from '../application/ApplicationTypes';
import deNs1 from './locales/de.json';
// import { Links } from '../utils/Constants';
import enNs1 from './locales/en.json';
import zhNs1 from './locales/zh.json';

export const defaultNS = 'ns1';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    defaultNS,
    resources: {
      en: {
        ns1: enNs1
      },
      zh: {
        ns1: zhNs1
      },
      de: {
        ns1: deNs1
      }
    }
  });

export const changeInternationalLanguage = (language: InternationalLanguage) => {
  i18n.changeLanguage(language);
};

export default i18n;
