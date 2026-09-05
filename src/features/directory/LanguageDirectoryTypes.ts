import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
  /**
   * Whether the current selection was applied as a *default* (the course's configured language, or
   * the first directory entry when there is no course) rather than chosen deliberately — by the
   * language dropdown, a share link, a textbook route, or an assessment.
   *
   * Only a default may be replaced by another default. Without this, a course configuration
   * arriving after the directory has loaded — a slow `fetchUserAndCourse`, or an admin changing the
   * course default in Ground Control — would overwrite a language the user had just picked.
   */
  readonly isDefaultSelection: boolean;
  readonly languages: ILanguageDefinition[];
  readonly languageMap: Record<string, ILanguageDefinition>;
};

/**
 * `defaultFileExtension` (e.g. "py" for Python) for the given language,
 * falling back to "js" — matching every language predating this field.
 */
export function getDefaultFileExtension(lang: ILanguageDefinition | undefined): string {
  return lang?.defaultFileExtension ?? 'js';
}

/** `getDefaultFileExtension` for the currently selected language in `state.languageDirectory`. */
export function selectDefaultFileExtension(state: LanguageDirectoryState): string {
  const { selectedLanguageId: langId, languageMap } = state;
  return getDefaultFileExtension(langId ? languageMap[langId] : undefined);
}
