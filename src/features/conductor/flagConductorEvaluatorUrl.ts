import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagConductorEvaluatorUrl = createFeatureFlag(
  'conductor.evaluator.url',
  '',
  'Optional override URL for a Conductor runner/evaluator. Leave empty to use the language-directory evaluator path.'
);

export const selectConductorEvaluatorUrl = featureSelector(flagConductorEvaluatorUrl);
