import React from 'react';

type Props = {
  indentationLevel: number;
};

const SPACING_PER_LEVEL = 19;

const FileSystemViewIndentationPadding: React.FC<Props> = ({ indentationLevel }) => {
  const indentationStyle: React.CSSProperties = {
    paddingLeft: `${SPACING_PER_LEVEL * indentationLevel}px`
  };

  return <div style={indentationStyle} />;
};

export default FileSystemViewIndentationPadding;
