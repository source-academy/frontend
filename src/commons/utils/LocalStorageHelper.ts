export const readLocalStorage = (key: string, defaultValue?: any) => {
  const localStorageValue = window.localStorage.getItem(key);
  return localStorageValue ? JSON.parse(localStorageValue) : defaultValue;
};

export const setLocalStorage = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};
