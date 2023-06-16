import React, { RefObject } from 'react';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { OverallState } from '../application/ApplicationTypes';
import Constants from './Constants';
import { readLocalStorage, setLocalStorage } from './LocalStorageHelper';

/**
 * This hook sends a request to the backend to fetch the initial state of the field
 *
 * @param requestFn The function that creates a request
 * @param defaultValue T
 */
export function useRequest<T>(requestFn: () => Promise<T>, defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    (async () => {
      const fetchedValue = await requestFn();
      setValue(fetchedValue);
    })();
  }, [requestFn]);

  return { value, setValue };
}

/**
 * This hook creates an input prop that can
 * be attached as props for text fields.
 * When attached as prop, any change in the text field
 * will cause the value of the hook to change
 *
 * @param defaultValue default value of input field
 */
export function useInput<T>(defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue);

  return {
    value,
    setValue,
    inputProps: {
      value,
      onChange: (event: any) => {
        setValue(event.target.value);
      }
    }
  };
}

/**
 * This hook usage is similar to React.useState, the only difference
 * being that the state is also written to local storage at the specified key on state updates.
 *
 * When calling this hook, the value will take on the stored value in local storage (if any).
 * If this key-value does not exist in local storage yet, the default value will be used.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(readLocalStorage(key, defaultValue));

  React.useEffect(() => {
    setLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

/** Typed version of useSelector. Use this instead of the useSelector hook. */
export const useTypedSelector: TypedUseSelectorHook<OverallState> = useSelector;
/**
 * Dynamically returns the dimensions (width & height) of an HTML element, updating whenever the
 * element is loaded or resized.
 *
 * @param ref A reference to the underlying HTML element.
 */

export const useDimensions = (ref: RefObject<HTMLElement>): [width: number, height: number] => {
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  const resizeObserver = React.useMemo(
    () =>
      new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        if (entries.length !== 1) {
          throw new Error(
            'Expected only a single HTML element to be observed by the ResizeObserver.'
          );
        }
        const contentRect = entries[0].contentRect;
        setWidth(contentRect.width);
        setHeight(contentRect.height);
      }),
    []
  );

  React.useEffect(() => {
    const htmlElement = ref.current;
    if (htmlElement === null) {
      return;
    }
    resizeObserver.observe(htmlElement);
    return () => resizeObserver.disconnect();
  }, [ref, resizeObserver]);

  return [width, height];
};

/**
 * Returns whether the current view falls under mobile
 * or desktop as defined by the constants file.
 */
export const useResponsive = () => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  return { isMobileBreakpoint };
};
