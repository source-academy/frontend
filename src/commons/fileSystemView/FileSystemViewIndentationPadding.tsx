import React from 'react';

export type FileSystemViewIndentationPaddingProps = {
  indentationLevel: number;
};

const SPACING_PER_LEVEL = 19;

const FileSystemViewIndentationPadding: React.FC<FileSystemViewIndentationPaddingProps> = (
  props: FileSystemViewIndentationPaddingProps
) => {
  const { indentationLevel } = props;

  const indentationStyle: React.CSSProperties = {
    paddingLeft: `${SPACING_PER_LEVEL * indentationLevel}px`
  };

  return <div style={indentationStyle} />;
};

export default FileSystemViewIndentationPadding;
