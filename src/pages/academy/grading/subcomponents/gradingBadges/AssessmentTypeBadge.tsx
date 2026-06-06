import type { BadgeSize } from 'src/components/ui/badge';
import { Badge } from 'src/components/ui/badge';

import { getBadgeColorFromLabel } from './gradingBadgeColors';

type Props = {
  type: string;
  size?: BadgeSize;
};

function AssessmentTypeBadge({ type, size = 'sm' }: Props) {
  return (
    <Badge color={getBadgeColorFromLabel(type)} size={size}>
      {size === 'xs' ? type.charAt(0).toUpperCase() : type}
    </Badge>
  );
}

export default AssessmentTypeBadge;
