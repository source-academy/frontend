import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { Flex } from '@tremor/react';

import { FilterBadge } from './TeamFormationBadges';

type TeamFormationFiltersProps = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const TeamFormationFilters: React.FC<TeamFormationFiltersProps> = ({ filters, onFilterRemove }) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-1">
      {filters.map(filter => (
        <FilterBadge filter={filter} onRemove={onFilterRemove} key={filter.id} />
      ))}
    </Flex>
  );
};

export default TeamFormationFilters;
