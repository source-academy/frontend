import 'i18next';

import { defaultLanguage, i18nLanguageCode } from './locales';

export type i18nDefaultLangKeys = (typeof defaultLanguage)[i18nLanguageCode.DEFAULT];

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    resources: i18nDefaultLangKeys;
  }
}
