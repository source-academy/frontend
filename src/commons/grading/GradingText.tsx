import { Classes, Text } from '@blueprintjs/core';
import clsx from 'clsx';
import React from 'react';

const defaultStyles: React.CSSProperties = {
  width: 'max-content',
  margin: 'auto 0'
};

type Props = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  isSecondaryText?: boolean;
  className?: string;
};

const GradingText: React.FC<Props> = ({ children, style, isSecondaryText, className }) => {
  return (
    <Text
      className={clsx(Classes.UI_TEXT, className, isSecondaryText && Classes.TEXT_MUTED)}
      style={{ ...defaultStyles, ...style }}
    >
      {children}
    </Text>
  );
};

export default GradingText;
