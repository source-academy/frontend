import { useMediaQuery } from '@mantine/hooks';
import React, { RefObject, } from 'react';
// eslint-disable-next-line no-restricted-imports
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { throttle } from 'lodash';

import { OverallState } from '../application/ApplicationTypes';
import { Tokens } from '../application/types/SessionTypes';
import Constants from './Constants';
import { readLocalStorage, setLocalStorage } from './LocalStorageHelper';
import SessionActions from '../application/actions/SessionActions';

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
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

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
    isDesktopBreakpoint: isMobileBreakpoint === undefined ? undefined : !isMobileBreakpoint
  };
};

/**
 * Returns session related information.
 */
export const useSession = () => {
  const session = useTypedSelector(state => state.session);
  const isLoggedIn = typeof session.name === 'string';
  const isEnrolledInACourse = !!session.role;

  return {
    ...session,
    isEnrolledInACourse,
    isLoggedIn
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
  const accessToken = useTypedSelector(state => state.session.accessToken);
  const refreshToken = useTypedSelector(state => state.session.refreshToken);
  if (throwWhenEmpty && (!accessToken || !refreshToken)) {
    throw new Error('No access token or refresh token found');
  }
  return { accessToken, refreshToken } as Tokens;
};



export function useTimer(
  path: string | undefined = undefined, 
  enableIdleTimer: boolean = true, 
  idleTime: number = 60000, 
  throttleTime: number = 100,
){
  const dispatch = useDispatch();
  const timerPath: string = path || useLocation().pathname.slice(1);

  const generateTimer = (
    name: string | undefined,
    idleTime: number,
    enableIdleTimer: boolean = true
  ) => {
    let start = 0;
    let timeElapsed = 0;
    let running = false;
    let stopWhenIdle: ReturnType<typeof setTimeout>;

    const startTimer = () => {
      if (enableIdleTimer) {
        if (stopWhenIdle) {
          clearTimeout(stopWhenIdle);
        }
        stopWhenIdle = generateIdleTimer(idleTime);
      }
      if (running) return;
      running = true;
      start = Date.now();
    };

    const stopTimer = () => {
      if (!running) return;
      if (stopWhenIdle) {
        clearTimeout(stopWhenIdle);
      }
      running = false;
      timeElapsed += Date.now() - start;
      start = Date.now();
    };

    const generateIdleTimer = (time: number) => {
      return setTimeout(() => {
        stopTimer();
      }, time);
    };

    return {
      name,
      startTimer,
      stopTimer,
      getTimeElapsed: () => Math.floor(timeElapsed / 1000),
    }
  };

  const timer = generateTimer(timerPath, idleTime, enableIdleTimer);
  const throttledStartTimer = throttle(timer.startTimer, throttleTime);

  const updateGlobalTimer = () => {
    timer.stopTimer();
    if (timerPath !== "") {
      dispatch(SessionActions.updateTimeSpent(timerPath, timer.getTimeElapsed()));
    }
  };

  useEffect(() => {
    const globalTimerUpdater = throttle(updateGlobalTimer, 100);
    timer.startTimer();

    document.addEventListener("keydown", throttledStartTimer);
    document.addEventListener("mousedown", throttledStartTimer);
    document.addEventListener("mousemove", throttledStartTimer);
    document.addEventListener("beforeunload", globalTimerUpdater);

    return () => {
      globalTimerUpdater();

      document.removeEventListener("keydown", throttledStartTimer);
      document.removeEventListener("mousedown", throttledStartTimer);
      document.removeEventListener("mousemove", throttledStartTimer);
      document.removeEventListener("beforeunload", globalTimerUpdater);
    };
  }, [timerPath]);
}
