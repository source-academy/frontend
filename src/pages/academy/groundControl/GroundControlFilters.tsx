import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { Flex } from '@tremor/react';

import { FilterBadge } from '../grading/subcomponents/GradingBadges';

type GroundControlFiltersProps = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const GroundControlFilters: React.FC<GroundControlFiltersProps> = ({
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

export default GroundControlFilters;
