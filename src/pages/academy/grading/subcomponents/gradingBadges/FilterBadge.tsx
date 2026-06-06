import { DismissibleBadge } from 'src/components/ui/badge';
import type { ColumnFilter } from 'src/features/grading/GradingTypes';

import { getBadgeColorFromLabel } from './gradingBadgeColors';

type Props = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

function FilterBadge({ filter, onRemove }: Props) {
  const filterValue = filter.value as string;
  const formattedFilterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);

  return (
    <DismissibleBadge
      color={getBadgeColorFromLabel(formattedFilterValue)}
      className="ml-1.25"
      ariaLabel={`Remove ${formattedFilterValue} filter`}
      onDismiss={() => onRemove(filter)}
    >
      {formattedFilterValue}
    </DismissibleBadge>
  );
}

export default FilterBadge;
