import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { Badge, Flex } from '@tremor/react';

import { badgeColor } from './colors';

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

type FilterBadgeProps = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

const FilterBadge: React.FC<FilterBadgeProps> = ({ filter, onRemove }) => {
  let filterValue = filter.value as string;
  filterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  return (
    <button type="button" onClick={() => onRemove(filter)} style={{ padding: 0 }}>
      <Badge
        text={filterValue}
        icon={() => <Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={badgeColor(filterValue)}
      />
    </button>
  );
};

export default GradingSubmissionFilters;
