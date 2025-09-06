import {
  generateLanguageMap,
  getLanguageDefinition,
  ILanguageDefinition,
  languages as staticLanguages
} from 'language-directory';

let languages: ILanguageDefinition[] = staticLanguages;
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
