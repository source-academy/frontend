import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { ProgressStatus } from 'src/commons/assessment/AssessmentTypes';
import { ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import { Badge } from 'src/components/ui/badge';

import { getBadgeColorFromLabel } from './gradingBadgeColors';

type Props = {
  progress: ProgressStatus;
};

function getProgressStatusIcon(progress: ProgressStatus) {
  switch (progress) {
    case ProgressStatuses.autograded:
      return IconNames.AIRPLANE;
    case ProgressStatuses.published:
      return IconNames.ENDORSED;
    case ProgressStatuses.graded:
      return IconNames.TICK;
    case ProgressStatuses.submitted:
      return IconNames.TIME;
    default:
      return IconNames.DISABLE;
  }
}

function ProgressStatusBadge({ progress }: Props) {
  const statusText = progress.charAt(0).toUpperCase() + progress.slice(1);

  return (
    <Badge
      color={getBadgeColorFromLabel(progress)}
      icon={<Icon icon={getProgressStatusIcon(progress)} />}
    >
      {statusText}
    </Badge>
  );
}

export default ProgressStatusBadge;
