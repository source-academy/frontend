import { useEffect, useState } from 'react';

export const readLocalStorage = (key: string, defaultValue?: any) => {
  const localStorageValue = window.localStorage.getItem(key);
  return localStorageValue ? JSON.parse(localStorageValue) : defaultValue;
};

export const setLocalStorage = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

/**
 * This hook usage is similar to useState, the only difference
 * being that the state is also written to local storage at the specified key on state updates.
 *
 * When calling this hook, the value will take on the stored value in local storage (if any).
 * If this key-value does not exist in local storage yet, the default value will be used.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(readLocalStorage(key, defaultValue));

  useEffect(() => {
    setLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
