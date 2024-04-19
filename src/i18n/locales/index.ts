import translationEN from './en';
import translationPSEUDO from './pseudo';

export enum i18nLanguageCode {
  ENGLISH = 'en',
  PSEUDO = 'pseudo'
}

export const defaultResources = {
  [i18nLanguageCode.ENGLISH]: {
    name: 'English',
    ...translationEN
  }
};

export const resources = {
  [i18nLanguageCode.ENGLISH]: {
    name: 'English',
    ...translationEN
  },
  [i18nLanguageCode.PSEUDO]: {
    name: 'Pseudo',
    ...translationPSEUDO
  }
};
