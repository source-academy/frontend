export const ONE_HOUR_IN_MILLISECONDS = 3600000;
const ONE_BYTE_IN_BITS = 8;
const ONE_KB_IN_BYTES = 1024;
const FIVE_MB_IN_KB = 5 * 1024;

const getLocalStorageSpace = () => {
  let allStrings = '';
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      allStrings += window.localStorage[key];
    }
  }
  return allStrings ? 3 + (allStrings.length * 16) / (ONE_BYTE_IN_BITS * ONE_KB_IN_BYTES) : 0;
};

export const hasExceededLocalStorageSpace = () => {
  return getLocalStorageSpace() > FIVE_MB_IN_KB;
};

export const PLAYGROUND_QUESTION_ID: number = -1;
