import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import { normalizeAceModeId } from '../conductor/autocompleteModeStore';

/**
 * The routes of the textbooks that the frontend has a page for: one folder of routes each
 * (`new_routes/sicpjs`, `new_routes/sicpy`). Which language a textbook is in, and what it looks like
 * (its name, its cover), is the language directory's: a textbook is a `textbook` of a language, at
 * its `route`.
 */
export const SICPJS_ROUTE = '/sicpjs';
export const SICPY_ROUTE = '/sicpy';

/** The routes of the textbooks that the directory has: where a language's `textbook` is. */
export function textbookRoutes(languages: readonly ILanguageDefinition[]): string[] {
  const routes = languages.flatMap(language =>
    language.textbook ? [language.textbook.route] : [],
  );
  return [...new Set(routes)];
}

/** Whether `pathname` is a page of one of the textbooks of the directory. */
export function isTextbookPath(
  languages: readonly ILanguageDefinition[],
  pathname: string,
): boolean {
  return textbookRoutes(languages).some(
    route => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** The first language of the directory that the textbook at `route` is in (its cover, its code). */
export function textbookLanguageAt(
  languages: readonly ILanguageDefinition[],
  route: string,
): ILanguageDefinition | undefined {
  return languages.find(language => language.textbook?.route === route);
}

/**
 * The name that the syntax highlighter knows the code of the textbook at `route` by: the directory's
 * Ace mode of its language (`javascript`, `python`), which is also the highlighter's name for it.
 * None while the directory is not loaded, or for a language without one: the code is shown plain.
 */
export function textbookHighlightLanguage(
  languages: readonly ILanguageDefinition[],
  route: string,
): string | undefined {
  const aceMode = (
    textbookLanguageAt(languages, route)?.editorConfig as { aceMode?: unknown } | undefined
  )?.aceMode;
  return typeof aceMode === 'string'
    ? normalizeAceModeId(aceMode).replace('ace/mode/', '')
    : undefined;
}
