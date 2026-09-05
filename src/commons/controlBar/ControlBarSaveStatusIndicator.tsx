import { Intent, type MaybeElement, Spinner, SpinnerSize, Tag, Tooltip } from '@blueprintjs/core';
import { type IconName, IconNames } from '@blueprintjs/icons';

import type { SaveStatus } from '../workspace/WorkspaceTypes';

type Props = {
  saveStatus: SaveStatus;
  isReadOnly?: boolean;
};

type StatusConfig = {
  label: string;
  icon: IconName | MaybeElement;
  intent: Intent;
};

const statusConfig: Record<Exclude<SaveStatus, 'idle'>, StatusConfig> = {
  saving: {
    label: 'Saving',
    icon: <Spinner size={SpinnerSize.SMALL} />,
    intent: Intent.NONE,
  },
  saved: {
    label: 'Saved',
    icon: IconNames.TICK,
    intent: Intent.SUCCESS,
  },
  saveFailed: {
    label: 'Saving failed',
    icon: IconNames.WARNING_SIGN,
    intent: Intent.DANGER,
  },
};

function ControlBarSaveStatusIndicator({ saveStatus, isReadOnly = false }: Props) {
  if (isReadOnly) {
    return (
      <Tooltip content="Submission already finalized or closed">
        <Tag minimal intent={Intent.WARNING} icon={IconNames.LOCK}>
          Unable to save
        </Tag>
      </Tooltip>
    );
  }

  if (saveStatus === 'idle') {
    return null;
  }

  const config = statusConfig[saveStatus];

  return (
    <Tag minimal intent={config.intent} icon={config.icon}>
      {config.label}
    </Tag>
  );
}

export default ControlBarSaveStatusIndicator;
