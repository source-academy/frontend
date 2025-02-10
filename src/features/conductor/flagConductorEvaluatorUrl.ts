import { createFeatureFlag } from 'src/commons/featureFlags';

export const flagConductorEvaluatorUrl = createFeatureFlag(
  'conductor.evaluator.url',
  'https://fyp.tsammeow.dev/evaluator/worker.js',
  'The URL where Conductor may find the Runner to be used for running user programs.'
);
