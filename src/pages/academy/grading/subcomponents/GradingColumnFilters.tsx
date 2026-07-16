import ColumnFilterBadge from './gradingBadges/ColumnFilterBadge';

type Props = {
  filters: string[];
  onFilterRemove: (toRemove: string) => void;
  filtersName: string[];
};

function GradingColumnFilters({ filters, onFilterRemove, filtersName }: Props) {
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
}

export default GradingColumnFilters;
