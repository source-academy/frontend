import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { OverallState } from '../application/ApplicationTypes';
import type { Tokens } from '../application/types/SessionTypes';
import type { SourceActionType } from './ActionsHelper';
import Constants from './Constants';

/**
 * This hook sends a request to the backend to fetch the initial state of the field
 *
 * @param requestFn The function that creates a request
 * @param defaultValue T
 */
export function useRequest<T>(requestFn: () => Promise<T>, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
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
  const [value, setValue] = useState<T>(defaultValue);

  return {
    value,
    setValue,
    inputProps: {
      value,
      onChange: (event: any) => {
        setValue(event.target.value);
      },
    },
  };
}

/** Typed version of useSelector. Use this instead of the useSelector hook. */
export const useAppSelector: TypedUseSelectorHook<OverallState> = useSelector;
export const useAppDispatch: () => React.Dispatch<SourceActionType> = useDispatch;

/**
 * Dynamically returns the dimensions (width & height) of an HTML element, updating whenever the
 * element is loaded or resized.
 *
 * @param ref A reference to the underlying HTML element.
 */

export const useDimensions = (
  ref: React.RefObject<HTMLElement | null>,
): [width: number, height: number] => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const resizeObserver = useMemo(
    () =>
      new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        if (entries.length !== 1) {
          throw new Error(
            'Expected only a single HTML element to be observed by the ResizeObserver.',
          );
        }
        const contentRect = entries[0].contentRect;
        setWidth(contentRect.width);
        setHeight(contentRect.height);
      }),
    [],
  );

  useEffect(() => {
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
  const isMobileBreakpoint = useMediaQuery(`(max-width: ${Constants.mobileBreakpoint}px)`);

  // Based on values from flexboxgrid-helpers
  const xs = useMediaQuery('(max-width: 48em)');
  const sm = useMediaQuery('(min-width:48em) and (max-width:64em)');
  const md = useMediaQuery('(min-width:64em) and (max-width:75em)');
  const lg = useMediaQuery('(min-width:75em)');

  return {
    xs,
    sm,
    md,
    lg,
    isMobileBreakpoint: isMobileBreakpoint,
    isDesktopBreakpoint: isMobileBreakpoint === undefined ? undefined : !isMobileBreakpoint,
  };
};

/**
 * Returns session related information.
 */
export const useSession = () => {
  const session = useAppSelector(state => state.session);
  const isLoggedIn = typeof session.name === 'string';
  const isEnrolledInACourse = !!session.role;

  return {
    ...session,
    isEnrolledInACourse,
    isLoggedIn,
  };
};

// Overload for useTokens
type UseTokens = {
  (): Tokens;
  (options: { throwWhenEmpty: true }): Tokens;
  (options: { throwWhenEmpty: false }): Partial<Tokens>;
};

/**
 * Returns the access token and refresh token from the session.
 * @param throwWhenEmpty (optional) If true, throws an error if no tokens are found.
 */
export const useTokens: UseTokens = ({ throwWhenEmpty = true } = {}) => {
  const accessToken = useAppSelector(state => state.session.accessToken);
  const refreshToken = useAppSelector(state => state.session.refreshToken);
  if (throwWhenEmpty && (!accessToken || !refreshToken)) {
    throw new Error('No access token or refresh token found');
  }
  return { accessToken, refreshToken } as Tokens;
};
