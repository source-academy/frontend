import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { Flex } from '@tremor/react';

import { FilterBadge } from './GradingBadges';

type Props = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const GradingSubmissionFilters: React.FC<Props> = ({ filters, onFilterRemove }) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-1">
      {filters.map(filter => (
        <FilterBadge filter={filter} onRemove={onFilterRemove} key={filter.id} />
      ))}
    </Flex>
  );
};

export default GradingSubmissionFilters;
