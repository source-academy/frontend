import type {
  IEvaluatorDefinition,
  ILanguageDefinition,
} from '@sourceacademy/language-directory/dist/types';

import { isToolEvaluator } from '../conductor/stepperTab';

// `family` is optional in the directory, and older directory versions or custom mirrors lack it.
type LanguageWithFamily = ILanguageDefinition & { readonly family?: string };

export type LanguageFamily = {
  readonly name: string;
  readonly languages: ILanguageDefinition[];
};

/** The family a language belongs to, falling back to the first word of its name (e.g. "Python §3"). */
export function getLanguageFamily(language: ILanguageDefinition): string {
  return (language as LanguageWithFamily).family ?? language.name.split(' ')[0];
}

/** The directory's languages grouped by family, in order of each family's first appearance. */
export function groupLanguagesByFamily(languages: ILanguageDefinition[]): LanguageFamily[] {
  const families = new Map<string, ILanguageDefinition[]>();
  for (const language of languages) {
    const family = getLanguageFamily(language);
    families.set(family, [...(families.get(family) ?? []), language]);
  }
  return [...families].map(([name, languages]) => ({ name, languages }));
}

/** The languages in the same family as `language`, including itself. */
export function getFamilyLanguages(
  languages: ILanguageDefinition[],
  language: ILanguageDefinition,
): ILanguageDefinition[] {
  const family = getLanguageFamily(language);
  return languages.filter(l => getLanguageFamily(l) === family);
}

/**
 * The label for `language` among its family's variants. A variant named just its family (e.g. full
 * Python, named "Python" beside "Python §1"-"Python §4") would be ambiguous, so it is marked "(Full)".
 */
export function getVariantLabel(
  language: ILanguageDefinition,
  familyLanguages: ILanguageDefinition[],
): string {
  const family = getLanguageFamily(language);
  return familyLanguages.length > 1 && language.name === family
    ? `${family} (Full)`
    : language.name;
}

/**
 * The variant to select when switching to `family`: `preferredLanguageId` (the course default) if it
 * belongs to the family, otherwise the family's first variant.
 */
export function pickVariantForFamily(
  languages: ILanguageDefinition[],
  family: string,
  preferredLanguageId?: string,
): ILanguageDefinition | undefined {
  const familyLanguages = languages.filter(l => getLanguageFamily(l) === family);
  return familyLanguages.find(l => l.id === preferredLanguageId) ?? familyLanguages[0];
}

/** The evaluators a user may pick as a runtime, i.e. excluding those reached only via their own tab. */
export function getSelectableEvaluators(language: ILanguageDefinition): IEvaluatorDefinition[] {
  return language.evaluators.filter(e => !isToolEvaluator(e));
}
