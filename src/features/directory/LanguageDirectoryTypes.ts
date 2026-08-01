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
export function getDefaultFileExtension(lang: ILanguageDefinition | null | undefined): string {
  return lang?.defaultFileExtension ?? 'js';
}
