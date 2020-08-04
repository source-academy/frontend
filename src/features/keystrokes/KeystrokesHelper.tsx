export const oneHourInMilliSeconds = 3600000;
const oneByteInBits = 8;
const oneKbInBytes = 1024;
const fiveMbInKb = 5 * 1024;

const getLocalStorageSpace = () => {
  let allStrings = '';
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      allStrings += window.localStorage[key];
    }
  }
  return allStrings ? 3 + (allStrings.length * 16) / (oneByteInBits * oneKbInBytes) : 0;
};

export const hasExceededLocalStorageSpace = () => {
  return getLocalStorageSpace() > fiveMbInKb;
};

export const playgroundQuestionId: number = -1;
