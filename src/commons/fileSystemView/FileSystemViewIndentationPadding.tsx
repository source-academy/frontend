type Props = {
  indentationLevel: number;
};

const SPACING_PER_LEVEL = 19;

function FileSystemViewIndentationPadding({ indentationLevel }: Props) {
  const indentationStyle: React.CSSProperties = {
    paddingLeft: `${SPACING_PER_LEVEL * indentationLevel}px`,
  };

  return <div style={indentationStyle} />;
}

export default FileSystemViewIndentationPadding;
