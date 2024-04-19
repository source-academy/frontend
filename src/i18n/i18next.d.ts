import 'i18next';

// import all namespaces (for the default language, only)
import commons from 'locales/en/commons.json';

import { i18nLanguageCode, resources } from './locales';

export type i18nDefaultLangKeys = (typeof resources)[i18nLanguageCode.ENGLISH];

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'commons';
    resources: i18nDefaultLangKeys;
  }
}
