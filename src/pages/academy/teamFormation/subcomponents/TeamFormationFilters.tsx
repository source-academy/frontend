import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import React from 'react';
import GradingFlex from 'src/commons/grading/GradingFlex';

import { FilterBadge } from './TeamFormationBadges';

type TeamFormationFiltersProps = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const TeamFormationFilters: React.FC<TeamFormationFiltersProps> = ({ filters, onFilterRemove }) => {
  return (
    <GradingFlex justifyContent="flex-start" style={{ columnGap: '0.25rem' }}>
      {filters.map(filter => (
        <FilterBadge filter={filter} onRemove={onFilterRemove} key={filter.id} />
      ))}
    </GradingFlex>
  );
};

export default TeamFormationFilters;
