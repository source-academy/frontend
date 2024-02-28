import { Flex } from '@tremor/react';

import { ColumnFilterBadge } from './GradingBadges';

type GradingSubmissionFiltersProps = {
  filters: string[];
  onFilterRemove: (toRemove: string) => void;
  filtersName: string[];
};

const GradingColumnFilters: React.FC<GradingSubmissionFiltersProps> = ({
  filters,
  onFilterRemove,
  filtersName
}) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-1">
      {filters.map((filter, index) => (
        <ColumnFilterBadge
          filter={filter}
          filtersName={filtersName[index]}
          onRemove={onFilterRemove}
          key={filter}
        />
      ))}
    </Flex>
  );
};

export default GradingColumnFilters;
