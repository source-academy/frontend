import { languageShareFields } from '../directory/languageIdCodec';

/** The fields of a share link that name the language of its program, in either scheme. */
const LANGUAGE_FIELDS = ['chap', 'language', 'variant', 'evaluator'];

/**
 * The share link of a snippet of the textbook: the snippet's own link (as the textbook has it),
 * naming the language that the snippet runs in by the fields of today's links (`language`,
 * `variant`, `evaluator`), whatever it named it by, if at all (a Source chapter as `chap`, from
 * before the language directory, or nothing, for a snippet that runs in the language of its
 * chapter). Legacy links are still *read* (see `handleHash`); the links that are made are not.
 *
 * The segments are edited as they are, not parsed and written again: a compressed program has `+`
 * in it, which a query string parser takes for a space.
 */
export function snippetShareHash(
  hash: string,
  selectedLanguageId: string | null,
  selectedEvaluatorId: string | null,
): string {
  // The directory loads after the editor mounts. Until a language is selected there is nothing to
  // name it by, and the snippet's own link, which may name one, is the better link.
  if (!selectedLanguageId) {
    return hash;
  }
  const kept = hash.split('&').filter(segment => {
    const name = segment.split('=')[0];
    return segment !== '' && !LANGUAGE_FIELDS.includes(name);
  });
  const fields = languageShareFields(selectedLanguageId, selectedEvaluatorId);
  const named = Object.entries(fields)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`);
  return [...kept, ...named].join('&');
}
