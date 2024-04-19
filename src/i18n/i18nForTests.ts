import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultLanguage, i18nLanguageCode } from './locales';

i18n.use(initReactI18next).init({
  lng: i18nLanguageCode.ENGLISH,
  fallbackLng: i18nLanguageCode.ENGLISH,
  debug: true,
  defaultNS: 'commons',
  resources: defaultLanguage,
  interpolation: {
    escapeValue: false // not needed for react!!
  }
});

export default i18n;
