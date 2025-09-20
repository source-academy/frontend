import {
  getEvaluatorDefinition,
  IEvaluatorDefinition,
  ILanguageDefinition,
  languageMap,
  languages
} from 'language-directory';

export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
  readonly languages: ILanguageDefinition[];
};

export interface LanguageDirectoryProvider {
  getLanguages(): Promise<ILanguageDefinition[]>;
  getLanguageById(languageId: string): Promise<ILanguageDefinition | undefined>;
  getEvaluatorDefinition(
    languageId: string,
    evaluatorId: string
  ): Promise<IEvaluatorDefinition | undefined>;
}

export class StaticLanguageDirectoryProvider implements LanguageDirectoryProvider {
  async getLanguages(): Promise<ILanguageDefinition[]> {
    return languages;
  }

  async getLanguageById(languageId: string): Promise<ILanguageDefinition | undefined> {
    return languageMap.get(languageId);
  }

  async getEvaluatorDefinition(
    languageId: string,
    evaluatorId: string
  ): Promise<IEvaluatorDefinition | undefined> {
    const language = languageMap.get(languageId);
    if (!language) return undefined;
    return getEvaluatorDefinition(language, evaluatorId);
  }
}

export const staticLanguageDirectoryProvider = new StaticLanguageDirectoryProvider();

export type { ILanguageDefinition, IEvaluatorDefinition };
