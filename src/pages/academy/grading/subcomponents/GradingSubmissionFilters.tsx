import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { Badge, Flex } from '@tremor/react';

type GradingSubmissinoFiltersProps = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const GradingSubmissionFilters: React.FC<GradingSubmissinoFiltersProps> = ({
  filters,
  onFilterRemove
}) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-1">
      {filters.map(filter => (
        <FilterBadge filter={filter} onRemove={onFilterRemove} key={filter.id} />
      ))}
    </Flex>
  );
};

// TODO: extract to a constants file
const FILTER_COLORS = {
  // assessments
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  // submission status
  submitted: 'green',
  attempting: 'yellow',
  attempted: 'red',

  // grading status
  graded: 'green',
  grading: 'yellow',
  none: 'red'
};

type FilterBadgeProps = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

const FilterBadge: React.FC<FilterBadgeProps> = ({ filter, onRemove }) => {
  let filterValue = filter.value as string;
  filterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  const filterColor = FILTER_COLORS[filterValue.toLowerCase()] || 'gray';

  return (
    <button type="button" onClick={() => onRemove(filter)} style={{ padding: 0 }}>
      <Badge
        text={filterValue}
        icon={() => <Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={filterColor}
      />
    </button>
  );
};

export default GradingSubmissionFilters;
