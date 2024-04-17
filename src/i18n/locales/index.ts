import translationEN from './en/common.json';
import translationPseudo from './pseudo/common.json';

export enum i18nLanguageCode {
  ENGLISH = 'en',
  PSEUDO = 'pseudo',
}

export const resources: { [language: string]: any } = {
  [i18nLanguageCode.ENGLISH]: {
    name: 'English',
    translation: translationEN,
  },
  [i18nLanguageCode.PSEUDO]: {
    name: 'Pseudo',
    translation: translationPseudo
  }
}