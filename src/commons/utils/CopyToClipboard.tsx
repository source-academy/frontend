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
  const handleClick: React.MouseEventHandler = useCallback(
    async e => {
      let success = false;
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        success = false;
      }
      onCopy?.(text, success);
      // Get original onClick handler if any
      const originalOnClick = (children?.props as any)?.onClick;
      if (typeof originalOnClick === 'function') {
        originalOnClick(e);
      }
    },
    [onCopy, text, children?.props]
  );

  return children ? cloneElement(children as any, { onClick: handleClick }) : null;
}

export default CopyToClipboard;
