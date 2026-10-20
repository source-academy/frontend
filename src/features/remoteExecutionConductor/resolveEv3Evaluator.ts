import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import { EV3_EVALUATOR_CAPABILITY } from '../conductor/stepperTab';

/**
 * Returns the script URL of `language`'s EV3 evaluator - the one carrying the `ev3` capability in
 * the language directory. The PVML compiler that turns a student's program into robot bytecode
 * must come from the directory, so that it matches the language and stays current with py-slang:
 * there is deliberately no bundled fallback, since a bundled copy silently goes stale (a stale one
 * compiled Python with §1/§2 comparison opcodes the robot's VM rejects). Throws a descriptive
 * error instead, which the run saga shows in the REPL.
 */
export function resolveEv3EvaluatorPath(language: ILanguageDefinition | undefined): string {
  if (language === undefined) {
    throw new Error(
      'Cannot run on the EV3: no language is selected. Select a language that supports the EV3.',
    );
  }
  const evaluator = language.evaluators.find(e =>
    (e.capabilities as string[] | undefined)?.includes(EV3_EVALUATOR_CAPABILITY),
  );
  if (evaluator === undefined) {
    throw new Error(
      `Cannot run on the EV3: the language directory has no EV3 evaluator for ${language.name}. ` +
        `Ask your course administrator to add an evaluator with the "${EV3_EVALUATOR_CAPABILITY}" capability.`,
    );
  }
  return evaluator.path;
}
