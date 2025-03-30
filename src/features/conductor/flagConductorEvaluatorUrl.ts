import { createFeatureFlag } from '../../commons/featureFlags';

export const flagConductorEvaluatorUrl = createFeatureFlag(
  'conductor.evaluator.url',
  'https://fyp.tsammeow.dev/evaluator/0.2.1/worker.js',
  'The URL where Conductor may find the Runner to be used for running user programs.'
);
