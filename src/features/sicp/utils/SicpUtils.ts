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

export const SICP_DEF_TB_LANG = 'en';
export const SICP_TB_LANG_KEY = 'sicp-textbook-lang';

export const setSicpLangLocalStorage = (value: string) => {
  setLocalStorage(SICP_TB_LANG_KEY, value);
  window.dispatchEvent(new Event('sicp-tb-lang-change'));
};

export const readSicpLangLocalStorage = () => {
  const data = readLocalStorage(SICP_TB_LANG_KEY, SICP_DEF_TB_LANG);
  return data;
};
