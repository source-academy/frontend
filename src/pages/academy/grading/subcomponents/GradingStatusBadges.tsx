import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Badge } from '@tremor/react';
import { GradingStatus } from 'src/commons/assessment/AssessmentTypes';

type AssessmentTypeBadgeProps = {
  type: string;
};

const AssessmentTypeBadge: React.FC<AssessmentTypeBadgeProps> = ({ type }) => {
  const badgeColor =
    type === 'Missions'
      ? 'indigo'
      : type === 'Quests'
      ? 'yellow'
      : type === 'Paths'
      ? 'sky'
      : 'gray';
  return <Badge text={type} color={badgeColor} />;
};

type SubmissionStatusBadgeProps = {
  status: string;
};

const SubmissionStatusBadge: React.FC<SubmissionStatusBadgeProps> = ({ status }) => {
  const badgeColor = status === 'submitted' ? 'green' : 'red';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge text={statusText} color={badgeColor} />;
};

type GradingStatusBadgeProps = {
  status: GradingStatus;
};

const GradingStatusBadge: React.FC<GradingStatusBadgeProps> = ({ status }) => {
  const badgeColor = status === 'graded' ? 'green' : status === 'grading' ? 'yellow' : 'red';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeIcon = () => (
    <Icon
      icon={
        status === 'graded'
          ? IconNames.TICK
          : status === 'grading'
          ? IconNames.TIME
          : status === 'none'
          ? IconNames.CROSS
          : IconNames.ERROR
      }
      style={{ marginRight: '0.5rem' }}
    />
  );
  return <Badge text={statusText} color={badgeColor} icon={badgeIcon} />;
};

export { AssessmentTypeBadge, SubmissionStatusBadge, GradingStatusBadge };
