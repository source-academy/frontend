import translationEN from './en';
import translationPSEUDO from './pseudo';
import translationZH from './zh-SG';

export enum i18nLanguageCode {
  ENGLISH = 'en',
  CHINESE = 'zh',
  PSEUDO = 'pseudo',
  DEFAULT = ENGLISH
}

/**
 * This holds the resources for the default language.
 * Defines all the available translation keys.
 */
export const defaultLanguage = {
  [i18nLanguageCode.ENGLISH]: {
    name: 'English',
    ...translationEN
  }
};

const productionReadyLanguages = {};

const developmentOnlyLanguages = {
  [i18nLanguageCode.PSEUDO]: {
    name: 'Pseudo',
    ...translationPSEUDO
  },
  [i18nLanguageCode.CHINESE]: {
    name: '中文',
    ...translationZH
  }
};

export const resources = {
  ...defaultLanguage,
  ...productionReadyLanguages,
  ...(process.env.NODE_ENV === 'development' ? developmentOnlyLanguages : {})
};
