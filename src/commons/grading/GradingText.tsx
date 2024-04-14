import { Text } from '@blueprintjs/core';
import { Classes } from '@blueprintjs/core';

type GradingTextProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  isSecondaryText?: boolean;
  className?: string;
} & React.RefAttributes<HTMLDivElement>;

const GradingText: React.FC<GradingTextProps> = ({
  children,
  style,
  isSecondaryText,
  className = ''
}) => {
  const defaultStyle: React.CSSProperties = {
    width: 'max-content',
    margin: 'auto 0'
  };

  return (
    <Text
      className={Classes.UI_TEXT + ' ' + className + (isSecondaryText ? ' bp5-text-muted' : '')}
      style={{ ...defaultStyle, ...style }}
    >
      {children}
    </Text>
  );
};

export default GradingText;
