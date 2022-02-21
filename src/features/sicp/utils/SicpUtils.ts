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
