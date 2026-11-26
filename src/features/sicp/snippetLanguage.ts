import { getLanguageOfTextbookChapter } from '@sourceacademy/language-directory';
import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import { convertParamToInt } from '../../commons/utils/ParamParseHelper';
import { parseQuery } from '../../commons/utils/QueryHelper';

/**
 * The textbook route and chapter that a location in the frontend is in, as the language directory
 * names them: `/sicpjs/3.2` is chapter `"3"` of the textbook at `/sicpjs`. A page that is not a
 * numbered section (the index, the foreword, a location outside a textbook) has no chapter.
 */
export function textbookChapterOf(
  pathname: string,
): { route: string; chapter: string } | undefined {
  const [, route, section] = pathname.split('/');
  const chapter = section?.match(/^(\d+)(\.|$)/)?.[1];
  return route && chapter ? { route: `/${route}`, chapter } : undefined;
}

/**
 * Whether a share link, as a snippet of the textbook carries it, says which language the program is
 * in: a `language` (Conductor languages), or a Source chapter as `chap` (links from before the
 * language directory).
 */
export function hashNamesLanguage(hash: string): boolean {
  const qs = parseQuery(hash);
  const chapter = convertParamToInt(qs.chap);
  return !!qs.language || (chapter !== null && chapter >= 1 && chapter <= 4);
}

/**
 * The language of the textbook chapter that a snippet is in (see `textbookChapterOf`), which is the
 * language that its program runs in unless its link says otherwise. The directory says which: the
 * `textbook.chapters` of each language.
 */
export function languageOfSnippetAt(
  languages: readonly ILanguageDefinition[],
  pathname: string,
): ILanguageDefinition | undefined {
  const at = textbookChapterOf(pathname);
  return at ? getLanguageOfTextbookChapter(languages, at.route, at.chapter) : undefined;
}
