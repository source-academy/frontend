export const scrollRefIntoView = (
  ref: HTMLElement | null,
  parentRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (!ref || !parentRef?.current) {
    return;
  }

  const parent = parentRef.current!;
  const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;
  parent.scrollTo({
    behavior: 'smooth',
    top: ref.offsetTop - relativeTop,
  });
};
