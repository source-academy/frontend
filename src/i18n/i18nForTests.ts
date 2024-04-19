import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultResources, i18nLanguageCode } from './locales';

i18n.use(initReactI18next).init({
  lng: i18nLanguageCode.ENGLISH,
  fallbackLng: i18nLanguageCode.ENGLISH,
  ns: ['translationsNS'],
  defaultNS: 'commons',

  debug: true,

  interpolation: {
    escapeValue: false // not needed for react!!
  },

  resources: defaultResources
});

export default i18n;
