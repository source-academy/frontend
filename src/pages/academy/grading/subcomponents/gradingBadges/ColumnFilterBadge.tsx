import { DismissibleBadge } from 'src/components/ui/badge';

import { getBadgeColorFromLabel } from './gradingBadgeColors';

type Props = {
  filter: string;
  onRemove: (toRemove: string) => void;
  filtersName: string;
};

function ColumnFilterBadge({ filter, onRemove, filtersName }: Props) {
  return (
    <DismissibleBadge
      color={getBadgeColorFromLabel(filter)}
      className="ml-1.25"
      ariaLabel={`Remove ${filtersName} filter`}
      onDismiss={() => onRemove(filter)}
    >
      {filtersName}
    </DismissibleBadge>
  );
}

export default ColumnFilterBadge;
