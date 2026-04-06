/**
 * Intermediate implementation of deprecated <Prompt /> component
 * from react-router's v5 to v6 upgrade.
 *
 * react-router plans to bring <Prompt /> back in the future. Until then,
 * we can use this suggested implementation.
 *
 * See: https://github.com/remix-run/react-router/issues/8139#issuecomment-1382428200
 */
import React from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';

// You can abstract `useBlocker` to use the browser's `window.confirm` dialog to
// determine whether or not the user should navigate within the current origin.
// `useBlocker` can also be used in conjunction with `useBeforeUnload` to
// prevent navigation away from the current origin.
//
// IMPORTANT: There are edge cases with this behavior in which React Router
// cannot reliably access the correct location in the history stack. In such
// cases the user may attempt to stay on the page but the app navigates anyway,
// or the app may stay on the correct page but the browser's history stack gets
// out of whack. You should test your own implementation thoroughly to make sure
// the tradeoffs are right for your users.
function usePrompt(
  message: string | null | undefined | false,
  { beforeUnload }: { beforeUnload?: boolean } = {}
) {
  const blocker = useBlocker(
    React.useCallback(
      () => (typeof message === 'string' ? !window.confirm(message) : false),
      [message]
    )
  );
  const prevState = React.useRef(blocker.state);
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    prevState.current = blocker.state;
  }, [blocker]);

  useBeforeUnload(
    React.useCallback(
      event => {
        if (beforeUnload && typeof message === 'string') {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [message, beforeUnload]
    ),
    { capture: true }
  );
}

// You can also reimplement the v5 <Prompt> component API
export function Prompt({ when, message, ...props }: PromptProps) {
  usePrompt(when ? message : false, props);
  return null;
}

interface PromptProps {
  when: boolean;
  message: string;
  beforeUnload?: boolean;
}
