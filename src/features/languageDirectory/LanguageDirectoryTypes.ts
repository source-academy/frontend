export type LanguageDirectoryState = {
  readonly selectedLanguageId: string | null;
  readonly selectedEvaluatorId: string | null;
};

export const defaultLanguageDirectoryState: LanguageDirectoryState = {
  selectedLanguageId: null,
  selectedEvaluatorId: null
};
