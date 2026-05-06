import { Intent, type MaybeElement, Spinner, SpinnerSize, Tag } from '@blueprintjs/core';
import { type IconName, IconNames } from '@blueprintjs/icons';
import React from 'react';

import type { SaveStatus } from '../workspace/WorkspaceTypes';

type Props = {
  saveStatus: SaveStatus;
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
    intent: Intent.NONE
  },
  saved: {
    label: 'Saved',
    icon: IconNames.TICK,
    intent: Intent.SUCCESS
  },
  saveFailed: {
    label: 'Saving failed',
    icon: IconNames.WARNING_SIGN,
    intent: Intent.DANGER
  }
};

export const ControlBarSaveStatusIndicator: React.FC<Props> = ({ saveStatus }) => {
  if (saveStatus === 'idle') {
    return null;
  }

  const config = statusConfig[saveStatus];

  return (
    <Tag minimal intent={config.intent} icon={config.icon}>
      {config.label}
    </Tag>
  );
};
