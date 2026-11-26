import { useAppSelector } from 'src/commons/utils/Hooks';
import {
  normalizeAceModeId,
  useAutocompleteMode,
} from 'src/features/conductor/autocompleteModeStore';

/**
 * The Ace mode id for the language currently selected in the language directory.
 *
 * The running evaluator's autocomplete plugin is the source of truth for a language's highlighting
 * (see `features/conductor/AutocompletePlugin.ts`). Until that evaluator has published its mode,
 * the language directory's `editorConfig.aceMode` is used, and `ace/mode/text` if that is unset.
 */
/**
 * The path of the evaluator that is selected in the language directory: what the evaluator's
 * plugins publish to the editor under (the Ace mode of its syntax, its analysis).
 */
export const useActiveEvaluatorPath = (): string | undefined =>
  useAppSelector(state => {
    const { selectedLanguageId, selectedEvaluatorId, languageMap } = state.languageDirectory;
    if (!selectedLanguageId || !selectedEvaluatorId) {
      return undefined;
    }
    return languageMap[selectedLanguageId]?.evaluators.find(
      evaluator => evaluator.id === selectedEvaluatorId,
    )?.path;
  });

export const useActiveAceMode = (): string => {
  const evaluatorPath = useActiveEvaluatorPath();
  const directoryMode = useAppSelector(state => {
    const { selectedLanguageId, languageMap } = state.languageDirectory;
    const editorConfig = selectedLanguageId
      ? (languageMap[selectedLanguageId]?.editorConfig as { aceMode?: unknown } | undefined)
      : undefined;
    return typeof editorConfig?.aceMode === 'string'
      ? normalizeAceModeId(editorConfig.aceMode)
      : 'ace/mode/text';
  });
  return useAutocompleteMode(evaluatorPath) ?? directoryMode;
};
