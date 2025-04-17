import 'i18next';

// import all namespaces (for the default language, only)
import commons from 'locales/en/commons.json';

import { defaultLanguage, i18nLanguageCode } from './locales';

export type i18nDefaultLangKeys = (typeof defaultLanguage)[i18nLanguageCode.DEFAULT];

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'commons';
    resources: i18nDefaultLangKeys;
  }
}
