import { ILanguageDefinition } from 'language-directory/dist/types';
export type { IEvaluatorDefinition, ILanguageDefinition } from 'language-directory/dist/types';
import { generateLanguageMap, getLanguageDefinition } from 'language-directory/dist/util';
export { getEvaluatorDefinition } from 'language-directory/dist/util';

let languages: ILanguageDefinition[] = [];
let languageMap = generateLanguageMap(languages);

export async function updateSupportedLanguages(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Can't retrieve language directory: ${response.status}`);
  }
  const result = (await response.json()) as ILanguageDefinition[];
  languages = result;
  languageMap = generateLanguageMap(languages);
}

export function getSupportedLanguages() {
  return languages;
}

export function getSupportedLanguageDefinition(languageId: string) {
  return getLanguageDefinition(languageMap, languageId);
}
