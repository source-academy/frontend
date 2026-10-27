import { ALL_LANGUAGES } from '../../commons/application/ApplicationTypes';
import type { SideContentLocation } from '../../commons/sideContent/SideContentTypes';
import { Links } from '../../commons/utils/Constants';
import { useAppSelector } from '../../commons/utils/Hooks';
import { getSourceDocsUrl } from '../../commons/utils/IntroductionHelper';
import { useConductorEnable } from '../conductor/flagConductorEnable';

type LanguageDocumentationLinks = {
  languageName: string;
  languageDocsUrl: string;
  modulesDocsUrl?: string;
};

const DEFAULT_LANGUAGE_NAME = 'Documentation';

/** The documentation pages of the selected language, or `undefined` if it has none. */
export function useLanguageDocumentation(
  workspaceLocation: SideContentLocation,
): LanguageDocumentationLinks | undefined {
  const conductorEnabled = useConductorEnable();
  const directoryLanguage = useAppSelector(state => {
    const { selectedLanguageId, languageMap } = state.languageDirectory;
    return selectedLanguageId ? languageMap[selectedLanguageId] : undefined;
  });
  const chapter = useAppSelector(state => state.workspaces[workspaceLocation].context.chapter);
  const variant = useAppSelector(state => state.workspaces[workspaceLocation].context.variant);

  if (!conductorEnabled) {
    const legacyLanguage = ALL_LANGUAGES.find(
      language => language.chapter === chapter && language.variant === variant,
    );
    return {
      languageName: legacyLanguage?.displayName ?? DEFAULT_LANGUAGE_NAME,
      languageDocsUrl: getSourceDocsUrl(chapter, variant) ?? Links.sourceDocs,
      modulesDocsUrl: Links.moduleDocs,
    };
  }

  const documentation = directoryLanguage?.documentation;
  return documentation
    ? {
        languageName: directoryLanguage.name,
        languageDocsUrl: documentation.languageUrl,
        modulesDocsUrl: documentation.modulesUrl,
      }
    : undefined;
}
