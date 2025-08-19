import { readLocalStorage, setLocalStorage } from 'src/commons/utils/LocalStorageHelper';

export const SICP_INDEX = 'index';
export const SICP_CACHE_KEY = 'sicp-section';

export const setSicpSectionLocalStorage = (value: string) => {
  setLocalStorage(SICP_CACHE_KEY, value);
};

export const readSicpSectionLocalStorage = () => {
  const data = readLocalStorage(SICP_CACHE_KEY, SICP_INDEX);
  return data;
};

const SICP_SUPPORTED_LANGUAGES = ['en', 'zh_CN'] as const satisfies readonly string[];
export type SicpSupportedLanguage = (typeof SICP_SUPPORTED_LANGUAGES)[number];
export const SICP_DEFAULT_LANGUAGE: SicpSupportedLanguage = 'en';

const sicplanguageKey = 'sicp-textbook-lang';

export const persistSicpLanguageToLocalStorage = (value: string) => {
  setLocalStorage(sicplanguageKey, value);
  window.dispatchEvent(new Event('sicp-tb-lang-change'));
};

export const getSicpLanguageFromLocalStorage = (): SicpSupportedLanguage | null => {
  const value = readLocalStorage(sicplanguageKey, null);
  if (!SICP_SUPPORTED_LANGUAGES.includes(value)) {
    return null;
  }
  return value as SicpSupportedLanguage;
};
