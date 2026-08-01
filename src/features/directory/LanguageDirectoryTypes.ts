import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
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
