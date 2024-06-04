import React from 'react';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { ColumnFilter, ColumnFiltersState } from 'src/features/grading/GradingTypes';

import { FilterBadge } from './GradingBadges';

type Props = {
  filters: ColumnFiltersState;
  onFilterRemove: (filter: ColumnFilter) => void;
};

const GradingSubmissionFilters: React.FC<Props> = ({ filters, onFilterRemove }) => {
  return (
    <GradingFlex
      justifyContent="flex-start"
      style={{ maxWidth: 'max(800px, 70vw)', marginRight: '10px' }}
    >
      {filters.map(filter => (
        <FilterBadge filter={filter} onRemove={onFilterRemove} key={filter.id} />
      ))}
    </GradingFlex>
  );
};

export default GradingSubmissionFilters;
