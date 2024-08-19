import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React from 'react';
import { ProgressStatus, ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import { ColumnFilter } from 'src/features/grading/GradingTypes';
import classes from 'src/styles/Grading.module.scss';
import badgeClasses from 'src/styles/GradingBadges.module.scss';

declare const sizeValues: readonly ['xs', 'sm', 'md', 'lg', 'xl'];
declare type Size = (typeof sizeValues)[number];

type BadgeProps = {
  text: string;
  /** First color is bg, second is text. Refer to {typeof AVAILABLE_COLORS} */
  color?: readonly [string, string];
  size?: Size;
  icon?: React.ReactNode;
};

const Badge: React.FC<BadgeProps> = props => {
  return (
    <div
      className={classNames(
        badgeClasses['grading-badge'],
        badgeClasses[`grading-badge-${props.size ?? 'sm'}`]
      )}
      style={{
        color: props.color?.[1] ?? '#000000',
        backgroundColor: props.color ? props.color[0] + '40' : ''
      }}
    >
      {props.icon}
      <span className={badgeClasses['grading-badge-text']}>{props.text}</span>
    </div>
  );
};

// First color is bg, second is text (text is more saturated/darker). Colors are referenced from tailwind css.
const AVAILABLE_COLORS = {
  indigo: ['#818cf8', '#4f46e5'],
  emerald: ['#6ee7b7', '#059669'],
  sky: ['#7dd3fc', '#0284c7'],
  green: ['#4ade80', '#15803d'],
  yellow: ['#fde047', '#ca8a04'],
  red: ['#f87171', '#b91c1c'],
  gray: ['#9ca3af', '#374151'],
  purple: ['#c084fc', '#7e22ce'],
  blue: ['#93c5fd', '#2563eb']
} as const;

const BADGE_COLORS = Object.freeze({
  // assessment types
  missions: AVAILABLE_COLORS.indigo,
  quests: AVAILABLE_COLORS.emerald,
  paths: AVAILABLE_COLORS.sky,

  // submission status
  [ProgressStatuses.autograded]: AVAILABLE_COLORS.purple,
  [ProgressStatuses.not_attempted]: AVAILABLE_COLORS.gray,
  [ProgressStatuses.attempting]: AVAILABLE_COLORS.red,
  [ProgressStatuses.attempted]: AVAILABLE_COLORS.red,

  // grading status
  [ProgressStatuses.submitted]: AVAILABLE_COLORS.yellow,
  [ProgressStatuses.graded]: AVAILABLE_COLORS.green,
  [ProgressStatuses.published]: AVAILABLE_COLORS.blue
});

// For supporting tables that still use Tremor & Tanstack (e.g TeamFormationBadges since they copied the old tanstack grading code)
// TO BE REMOVED AFTER THEY MIGRATE TO BLUEPRINTJS/AGGRID
const BADGE_COLORS_LEGACY = Object.freeze({
  // assessment types
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  // submission status
  [ProgressStatuses.autograded]: 'purple',
  [ProgressStatuses.not_attempted]: 'gray',
  [ProgressStatuses.attempting]: 'red',
  [ProgressStatuses.attempted]: 'red',

  // grading status
  [ProgressStatuses.submitted]: 'yellow',
  [ProgressStatuses.graded]: 'green',
  [ProgressStatuses.published]: 'blue'
});

function getBadgeColorFromLabel(label: string) {
  const maybeKey = label.toLowerCase() as keyof typeof BADGE_COLORS;
  return BADGE_COLORS[maybeKey] || AVAILABLE_COLORS.gray;
}

// For supporting tables that still use Tremor & Tanstack (e.g TeamFormationBadges since they copied the old tanstack grading code)
// TO BE REMOVED AFTER THEY MIGRATE TO BLUEPRINTJS/AGGRID
export function getBadgeColorFromLabelLegacy(label: string) {
  const maybeKey = label.toLowerCase() as keyof typeof BADGE_COLORS_LEGACY;
  return BADGE_COLORS_LEGACY[maybeKey] || 'gray';
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

type ColumnFilterBadgeProps = {
  filter: string;
  onRemove: (toRemove: string) => void;
  filtersName: string;
};

const ColumnFilterBadge: React.FC<ColumnFilterBadgeProps> = ({ filter, onRemove, filtersName }) => {
  return (
    <button
      type="button"
      className={classes['grading-overview-filterable-btns']}
      onClick={() => onRemove(filter)}
      style={{ marginLeft: '5px' }}
    >
      <Badge
        text={filtersName}
        icon={<Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={getBadgeColorFromLabel(filter)}
      />
    </button>
  );
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
      className={classes['grading-overview-filterable-btns']}
      onClick={() => onRemove(filter)}
      style={{ marginLeft: '5px' }}
    >
      <Badge
        text={filterValue}
        icon={<Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={getBadgeColorFromLabel(filterValue)}
      />
    </button>
  );
};

type ProgressStatusBadgeProps = {
  progress: ProgressStatus;
};

const ProgressStatusBadge: React.FC<ProgressStatusBadgeProps> = ({ progress }) => {
  const statusText = progress.charAt(0).toUpperCase() + progress.slice(1);
  const badgeIcon = (
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

export { AssessmentTypeBadge, ColumnFilterBadge, FilterBadge, ProgressStatusBadge };
