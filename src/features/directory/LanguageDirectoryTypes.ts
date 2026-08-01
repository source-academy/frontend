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
 *
 * TODO: drop this cast once @sourceacademy/language-directory is bumped
 * past the version that adds `defaultFileExtension` to ILanguageDefinition
 * (source-academy/language-directory#55) — the field is already present at
 * runtime (directory.json), just not yet in the pinned package's types.
 */
export function getDefaultFileExtension(lang: ILanguageDefinition | null | undefined): string {
  return (
    (lang as (ILanguageDefinition & { defaultFileExtension?: string }) | null | undefined)
      ?.defaultFileExtension ?? 'js'
  );
}
