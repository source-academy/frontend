import { readLocalStorage, setLocalStorage } from 'src/commons/hooks/useLocalStorageState';

export const SICP_INDEX = 'index';
export const SICP_CACHE_KEY = 'sicp-section';

export const setSicpSectionLocalStorage = (value: string) => {
  setLocalStorage(SICP_CACHE_KEY, value);
};

export const readSicpSectionLocalStorage = () => {
  const data = readLocalStorage(SICP_CACHE_KEY, SICP_INDEX);
  return data;
};

export const scrollRefIntoView = (
  ref: HTMLElement | null,
  parentRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (!ref || !parentRef?.current) {
    return;
  }

  const parent = parentRef.current!;
  const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;
  parent.scrollTo({
    behavior: 'smooth',
    top: ref.offsetTop - relativeTop,
  });
};
