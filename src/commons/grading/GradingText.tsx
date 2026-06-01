import { Classes, Text } from '@blueprintjs/core';
import classNames from 'classnames';

const defaultStyles: React.CSSProperties = {
  width: 'max-content',
  margin: 'auto 0',
};

type Props = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  isSecondaryText?: boolean;
  className?: string;
};

function GradingText({ children, style, isSecondaryText, className }: Props) {
  return (
    <Text
      className={classNames(Classes.UI_TEXT, className, isSecondaryText && Classes.TEXT_MUTED)}
      style={{ ...defaultStyles, ...style }}
    >
      {children}
    </Text>
  );
}

export default GradingText;
