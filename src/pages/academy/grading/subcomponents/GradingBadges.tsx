import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter } from '@tanstack/react-table';
import { Badge } from '@tremor/react';
import { ProgressStatus, ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';

const BADGE_COLORS = Object.freeze({
  // assessment types
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  // ProgressStatus
  [ProgressStatuses.autograded]: 'purple',
  [ProgressStatuses.not_attempted]: 'gray',
  [ProgressStatuses.attempting]: 'red',
  [ProgressStatuses.attempted]: 'red',
  [ProgressStatuses.submitted]: 'yellow',
  [ProgressStatuses.graded]: 'green',
  [ProgressStatuses.published]: 'blue'
});

export function getBadgeColorFromLabel(label: string) {
  const maybeKey = label.toLowerCase() as keyof typeof BADGE_COLORS;
  return BADGE_COLORS[maybeKey] || 'gray';
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

type ProgressStatusBadgeProps = {
  progress: ProgressStatus;
};

const ProgressStatusBadge: React.FC<ProgressStatusBadgeProps> = ({ progress }) => {
  const statusText = progress.charAt(0).toUpperCase() + progress.slice(1);
  const badgeIcon = () => (
    <Icon
      icon={
        progress === ProgressStatuses.autograded
          ? IconNames.AIRPLANE
          : progress === ProgressStatuses.published
          ? IconNames.ENDORSED
          : progress === ProgressStatuses.graded
          ? IconNames.TICK
          : progress === ProgressStatuses.submitted
          ? IconNames.TIME
          : IconNames.DISABLE
      }
      style={{ marginRight: '0.5rem' }}
    />
  );
  return <Badge text={statusText} color={getBadgeColorFromLabel(progress)} icon={badgeIcon} />;
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

export { AssessmentTypeBadge, FilterBadge, ProgressStatusBadge };
