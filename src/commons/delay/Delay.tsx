import React from 'react';

export type DelayProps = {
  children: JSX.Element;
  waitBeforeRender: number;
};

const Delay: React.FC<DelayProps> = (props: DelayProps) => {
  const { children, waitBeforeRender } = props;

  const [isRendered, setIsRendered] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => setIsRendered(true), waitBeforeRender);
    return () => clearTimeout(timeoutId);
  }, [waitBeforeRender]);

  return isRendered ? children : <></>;
};

export default Delay;
