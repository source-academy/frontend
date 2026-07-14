import { useEffect, useState } from 'react';

const tryParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage value:`, error);
    return null;
  }
};

export const readLocalStorage = <T>(key: string, defaultValue: T) => {
  const localStorageValue = window.localStorage.getItem(key);
  return localStorageValue ? (tryParse<T>(localStorageValue) ?? defaultValue) : defaultValue;
};

export const setLocalStorage = <T>(key: string, value: T) => {
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
  const [value, setValue] = useState<T>(() => readLocalStorage(key, defaultValue));

  useEffect(() => {
    setLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
