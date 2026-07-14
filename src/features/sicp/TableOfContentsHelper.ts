/**
 * Each entry in a toc-navigation JSON maps a section slug to its neighbours.
 * Both `next` and `prev` are optional because the first entry has no `prev`
 * and the last entry has no `next`.
 */
type TocNavigationNode = { next?: string; prev?: string };
type TocNavigation = Record<string, TocNavigationNode>;

/**
 * Returns the section slug that follows `section` in the textbook, per the supplied
 * toc-navigation JSON. Returns `undefined` if `section` is not present, or if the
 * entry has no `next`.
 *
 * The toc-navigation JSON is passed in by the caller so that the same helper can
 * serve both SICP JS (`toc-navigation.json`) and SICPy (`toc-navigation-py.json`).
 */
export const getNext = (tocNavigation: TocNavigation, section: string): string | undefined => {
  return tocNavigation[section]?.next;
};

/**
 * Returns the section slug that precedes `section` in the textbook, per the
 * supplied toc-navigation JSON. Returns `undefined` if `section` is not present,
 * or if the entry has no `prev`.
 */
export const getPrev = (tocNavigation: TocNavigation, section: string): string | undefined => {
  return tocNavigation[section]?.prev;
};
