import React from 'react';

import { ColumnFilterBadge } from './GradingBadges';

type Props = {
  filters: string[];
  onFilterRemove: (toRemove: string) => void;
  filtersName: string[];
};

const GradingColumnFilters: React.FC<Props> = ({ filters, onFilterRemove, filtersName }) => {
  return (
    <div>
      {filters.map((filter, index) => (
        <ColumnFilterBadge
          filter={filter}
          filtersName={filtersName[index]}
          onRemove={onFilterRemove}
          key={filter}
        />
      ))}
    </div>
  );
};

export default GradingColumnFilters;
