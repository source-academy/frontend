import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter } from '@tanstack/react-table';
import { Badge } from '@tremor/react';
import {
  GradingStatus,
  GradingStatuses,
  SubmissionProgress
} from 'src/commons/assessment/AssessmentTypes';

const BADGE_COLORS = {
  // assessment types
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  // submission status
  published: 'blue',
  submitted: 'green',
  attempting: 'yellow',
  attempted: 'red',

  // published status - assumes no other boolean usage here, change if required.
  true: 'green',
  false: 'red',

  // grading status
  graded: 'green',
  grading: 'yellow',
  none: 'red'
};

export function getBadgeColorFromLabel(label: string) {
  return BADGE_COLORS[label.toLowerCase()] || 'gray';
}

type AssessmentTypeBadgeProps = {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const AssessmentTypeBadge: React.FC<AssessmentTypeBadgeProps> = ({ type, size = 'sm' }) => {
  return (
    <Badge
      text={size === 'xs' ? type.charAt(0).toUpperCase() : type}
      size={size}
      color={getBadgeColorFromLabel(type)}
    />
  );
};

type SubmissionProgressBadgeProps = {
  progress: SubmissionProgress;
};

const SubmissionProgressBadge: React.FC<SubmissionProgressBadgeProps> = ({ progress }) => {
  const statusText = progress.charAt(0).toUpperCase() + progress.slice(1);
  return <Badge text={statusText} color={getBadgeColorFromLabel(progress)} />;
};

type GradingStatusBadgeProps = {
  status: GradingStatus;
};

const GradingStatusBadge: React.FC<GradingStatusBadgeProps> = ({ status }) => {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeIcon = () => (
    <Icon
      icon={
        status === GradingStatuses.graded
          ? IconNames.TICK
          : status === GradingStatuses.grading
          ? IconNames.TIME
          : status === GradingStatuses.none
          ? IconNames.CROSS
          : IconNames.DISABLE
      }
      style={{ marginRight: '0.5rem' }}
    />
  );
  return <Badge text={statusText} color={getBadgeColorFromLabel(status)} icon={badgeIcon} />;
};

type FilterBadgeProps = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

const FilterBadge: React.FC<FilterBadgeProps> = ({ filter, onRemove }) => {
  let filterValue = filter.value as string;
  filterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  return (
    <button
      type="button"
      className="grading-overview-filterable-btns"
      onClick={() => onRemove(filter)}
    >
      <Badge
        text={filterValue}
        icon={() => <Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={getBadgeColorFromLabel(filterValue)}
      />
    </button>
  );
};

export { AssessmentTypeBadge, FilterBadge, GradingStatusBadge, SubmissionProgressBadge };
