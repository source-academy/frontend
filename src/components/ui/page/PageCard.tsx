import { Card, Elevation } from '@blueprintjs/core';
import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
  elevation?: Elevation;
  className?: string;
  style?: React.CSSProperties;
};

function PageCard({ children, elevation = Elevation.TWO, className, style }: Props) {
  return (
    <Card
      className={classNames('inline-block p-5 w-[80%] max-w-[90%]', className)}
      elevation={elevation}
      style={style}
    >
      {children}
    </Card>
  );
}

export default PageCard;
