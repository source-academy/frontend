import { useEffect, useMemo, useState } from 'react';

/**
 * Dynamically returns the dimensions (width & height) of an HTML element, updating whenever the
 * element is loaded or resized.
 *
 * @param ref A reference to the underlying HTML element.
 */
export function useDimensions(
  ref: React.RefObject<HTMLElement | null>,
): [width: number, height: number] {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const resizeObserver = useMemo(
    () =>
      new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        if (entries.length !== 1) {
          throw new Error(
            'Expected only a single HTML element to be observed by the ResizeObserver.',
          );
        }
        const contentRect = entries[0].contentRect;
        setWidth(contentRect.width);
        setHeight(contentRect.height);
      }),
    [],
  );

  useEffect(() => {
    const htmlElement = ref.current;
    if (htmlElement === null) {
      return;
    }
    resizeObserver.observe(htmlElement);
    return () => resizeObserver.disconnect();
  }, [ref, resizeObserver]);

  return [width, height];
}
