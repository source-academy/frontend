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
