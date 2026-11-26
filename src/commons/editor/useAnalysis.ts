import { useRef } from 'react';

import type { AnalysisProvider } from '../../features/conductor/analysisStore';
import { useAnalysisProvider } from '../../features/conductor/analysisStore';
import { useActiveEvaluatorPath } from './useActiveAceMode';

/**
 * What the selected evaluator offers the editor about the code (scope highlighting, go to
 * definition, rename): `undefined` until the evaluator has said which analyses it answers, and for
 * an evaluator that answers none. The editor features that are built on it do nothing then, and
 * need no name of a language to know it.
 *
 * A ref, so that callbacks created once per editor still see the current evaluator.
 */
export const useAnalysis = (): React.RefObject<AnalysisProvider | undefined> => {
  const provider = useAnalysisProvider(useActiveEvaluatorPath());
  const analysis = useRef(provider);
  analysis.current = provider;
  return analysis;
};

type AnalysisEditor = {
  session: unknown;
  getValue(): string;
  getCursorPosition(): { row: number; column: number };
};

/**
 * What the editor looks at when it asks the evaluator a question, and whether an answer is still
 * for that. The evaluator answers later: the code may have changed, the cursor may have moved, the
 * tab may have been switched (Ace keeps the editor and replaces its session), or another evaluator
 * may have been selected. An answer that is not for the editor as it is now must not be applied.
 */
export function captureAnalysisRequest(
  editor: AnalysisEditor,
  analysis: React.RefObject<AnalysisProvider | undefined>,
) {
  const provider = analysis.current;
  const session = editor.session;
  const code = editor.getValue();
  const cursor = editor.getCursorPosition();
  return {
    provider,
    code,
    cursor,
    /** The cursor, as the protocol has a position. */
    position: { line: cursor.row, character: cursor.column },
    /** Whether the editor, the code, the cursor and the evaluator are still as they were. */
    isCurrent: () => {
      const now = editor.getCursorPosition();
      return (
        analysis.current === provider &&
        editor.session === session &&
        editor.getValue() === code &&
        now.row === cursor.row &&
        now.column === cursor.column
      );
    },
  };
}
