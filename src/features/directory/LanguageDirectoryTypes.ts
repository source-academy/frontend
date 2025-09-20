import { ILanguageDefinition } from 'language-directory/dist/types';

export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
  readonly languages: ILanguageDefinition[];
  readonly languageMap: Record<string, ILanguageDefinition>;
};
