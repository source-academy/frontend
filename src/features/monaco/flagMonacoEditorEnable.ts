import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagMonacoEditorEnable = createFeatureFlag(
  'monaco.editor.enable',
  false,
  'Enables the Monaco editor shell in place of Ace.'
);

export const selectMonacoEditorEnable = featureSelector(flagMonacoEditorEnable);
