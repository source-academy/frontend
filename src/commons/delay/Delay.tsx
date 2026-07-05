import { useEffect, useState } from 'react';

type Props = {
  children: React.ReactElement;
  waitInMsBeforeRender: number;
};

/**
 * Delays the rendering of child components by a set time.
 */
function Delay({ children, waitInMsBeforeRender }: Props) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsRendered(true), waitInMsBeforeRender);
    return () => clearTimeout(timeoutId);
  }, [waitInMsBeforeRender]);

  return isRendered ? children : <></>;
}

export default Delay;
