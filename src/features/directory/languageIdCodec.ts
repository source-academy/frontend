// Language directory ids follow an unenforced but consistent convention (see
// @sourceacademy/language-directory's directory.json): a language id is an optional trailing
// chapter/variant number appended to a base name (e.g. "python2", "source1", "pythonFull" has
// none), and an evaluator id is always its language id followed by a PascalCase suffix (e.g.
// "python2Pvml"). Share links encode these as three separate fields (language/variant/evaluator)
// instead of the raw compound ids, so this module is the single place that (de)composes them.

const LANGUAGE_ID_VARIANT_PATTERN = /^(.+?)(\d+)$/;

export function splitLanguageId(languageId: string): { language: string; variant?: string } {
  const match = languageId.match(LANGUAGE_ID_VARIANT_PATTERN);
  if (!match) {
    return { language: languageId };
  }
  return { language: match[1], variant: match[2] };
}

export function joinLanguageId(language: string, variant?: string): string {
  return variant ? `${language}${variant}` : language;
}

export function splitEvaluatorId(languageId: string, evaluatorId: string): string | undefined {
  return evaluatorId.startsWith(languageId) ? evaluatorId.slice(languageId.length) : undefined;
}

export function joinEvaluatorId(languageId: string, evaluatorSuffix: string): string {
  return `${languageId}${evaluatorSuffix}`;
}
