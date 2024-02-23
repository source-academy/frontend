import React from 'react';

export type DelayProps = {
  children: JSX.Element;
  waitInMsBeforeRender: number;
};

/**
 * Delays the rendering of child components by a set time.
 */
const Delay: React.FC<DelayProps> = ({ children, waitInMsBeforeRender }) => {
  const [isRendered, setIsRendered] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => setIsRendered(true), waitInMsBeforeRender);
    return () => clearTimeout(timeoutId);
  }, [waitInMsBeforeRender]);

  return isRendered ? children : <></>;
};

export default Delay;
