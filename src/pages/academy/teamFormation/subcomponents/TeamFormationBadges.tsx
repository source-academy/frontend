import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter } from '@tanstack/react-table';
import { Badge } from '@tremor/react';
import React from 'react';

import { getBadgeColorFromLabelLegacy } from '../../grading/subcomponents/GradingBadges';

type Props = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

const FilterBadge: React.FC<Props> = ({ filter, onRemove }) => {
  let filterValue = filter.value as string;
  filterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  return (
    <button type="button" onClick={() => onRemove(filter)} style={{ padding: 0 }}>
      <Badge
        text={filterValue}
        icon={() => <Icon icon={IconNames.CROSS} style={{ marginRight: '0.25rem' }} />}
        color={getBadgeColorFromLabelLegacy(filterValue)}
      />
    </button>
  );
};

export { FilterBadge };
