import { useAppSelector } from '../../commons/utils/Hooks';

type LanguageDocumentationLinks = {
  languageName: string;
  languageDocsUrl: string;
  modulesDocsUrl?: string;
};

/** The documentation pages of the selected language, or `undefined` if it has none. */
export function useLanguageDocumentation(): LanguageDocumentationLinks | undefined {
  const directoryLanguage = useAppSelector(state => {
    const { selectedLanguageId, languageMap } = state.languageDirectory;
    return selectedLanguageId ? languageMap[selectedLanguageId] : undefined;
  });

  const documentation = directoryLanguage?.documentation;
  return documentation
    ? {
        languageName: directoryLanguage.name,
        languageDocsUrl: documentation.languageUrl,
        modulesDocsUrl: documentation.modulesUrl,
      }
    : undefined;
}
