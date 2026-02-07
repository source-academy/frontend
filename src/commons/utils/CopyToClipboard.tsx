import { cloneElement, useCallback } from 'react';

type Props = {
  children?: React.ReactElement;
  text: string;
  onCopy?(text: string, result: boolean): void;
};

/**
 * Follows the similar API as react-copy-to-clipboard but uses
 *  modern Clipboard/React APIs.
 */
function CopyToClipboard({ children, text, onCopy }: Props) {
  const handleClick = useCallback(async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (err) {
      success = false;
    }
    onCopy?.(text, success);
  }, [text, onCopy]);

  return children ? cloneElement(children, { onClick: handleClick }) : null;
}

export default CopyToClipboard;
