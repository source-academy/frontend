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
