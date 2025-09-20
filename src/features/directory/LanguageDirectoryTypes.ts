import { ILanguageDefinition } from 'language-directory';

export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
  readonly languages: ILanguageDefinition[];
  readonly languageMap: Record<string, ILanguageDefinition>;
};
