import type { IEvaluatorDefinition, ILanguageDefinition } from '@sourceacademy/language-directory';
import { getEvaluatorDefinition as getEvaluatorDefinitionFromDirectory, languageMap, languages } from '@sourceacademy/language-directory';

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
    return getEvaluatorDefinitionFromDirectory(language, evaluatorId);
  }
}

export const staticLanguageDirectoryProvider = new StaticLanguageDirectoryProvider();

export type { ILanguageDefinition, IEvaluatorDefinition };


