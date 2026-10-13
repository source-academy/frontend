import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import { ALL_LANGUAGES } from '../../commons/application/ApplicationTypes';
import type { SideContentLocation } from '../../commons/sideContent/SideContentTypes';
import { Links } from '../../commons/utils/Constants';
import { useAppSelector } from '../../commons/utils/Hooks';
import { getSourceDocsUrl } from '../../commons/utils/IntroductionHelper';
import { useConductorEnable } from '../conductor/flagConductorEnable';

// TODO: Use ILanguageDefinition['documentation'] once the language directory package provides it
type LanguageDocumentation = {
  languageUrl?: string;
  modulesUrl?: string;
};

type DocumentedLanguage = ILanguageDefinition & { documentation?: LanguageDocumentation };

type LanguageDocumentationLinks = {
  languageName: string;
  languageDocsUrl: string;
  modulesDocsUrl: string;
};

const DEFAULT_LANGUAGE_NAME = 'Documentation';

export function useLanguageDocumentation(
  workspaceLocation: SideContentLocation,
): LanguageDocumentationLinks {
  const conductorEnabled = useConductorEnable();
  const directoryLanguage: DocumentedLanguage | undefined = useAppSelector(state => {
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

  return {
    languageName: directoryLanguage?.name ?? DEFAULT_LANGUAGE_NAME,
    languageDocsUrl: directoryLanguage?.documentation?.languageUrl ?? Links.sourceDocs,
    modulesDocsUrl: directoryLanguage?.documentation?.modulesUrl ?? Links.moduleDocs,
  };
}
